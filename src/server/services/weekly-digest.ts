import { env } from '@/env';
import { db, linkClicks, links, products, userSettings } from '@/server/db';
import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
import { sendTrackedEmailNotification } from '@/server/services/notification-dispatches';
import { buildShortLinkUrl } from '@/utils/short-link';
import { and, asc, count, desc, eq, gte, isNull, sql } from 'drizzle-orm';

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type WeeklyDigestTarget = {
  userId: string;
  email: string;
  name: string;
  slug: string;
  timezone: string;
  ccEmail: string | null;
  digestDay: Weekday;
};

type WeeklyTopLink = {
  slug: string;
  productName: string;
  shortUrl: string;
  clicks: number;
};

type WeeklyBrokenLink = {
  slug: string;
  productName: string;
  shortUrl: string;
  statusCode: number | null;
  lastCheckedAt: Date | null;
};

type WeeklyDigestData = {
  activeLinksCount: number;
  brokenLinksCount: number;
  totalClicks: number;
  topLinks: WeeklyTopLink[];
  brokenLinks: WeeklyBrokenLink[];
  periodLabel: string;
};

export type WeeklyDigestRunResult = {
  eligibleUsers: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
};

function normalizeTimeZone(timezone: string | null | undefined) {
  const value = timezone?.trim();
  if (!value) return 'UTC';

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return value;
  } catch {
    return 'UTC';
  }
}

function getLocalWeekday(date: Date, timezone: string): Weekday {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: timezone,
  })
    .format(date)
    .toLowerCase();

  return weekday as Weekday;
}

function getLocalHour(date: Date, timezone: string) {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).format(date),
  );
}

function formatPeriodLabel(start: Date, end: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: timezone,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatLocalDateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function getWeeklyDigestTargets(now: Date) {
  const settings = await db.query.userSettings.findMany({
    where: eq(userSettings.weeklyDigest, true),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
          slug: true,
          timezone: true,
        },
      },
    },
  });

  return settings
    .map((setting) => {
      if (!setting.user?.email) return null;

      const timezone = normalizeTimeZone(setting.user.timezone);
      const localWeekday = getLocalWeekday(now, timezone);
      const localHour = getLocalHour(now, timezone);

      if (localWeekday !== setting.digestDay || localHour !== env.WEEKLY_DIGEST_HOUR) {
        return null;
      }

      return {
        userId: setting.user.id,
        email: setting.user.email,
        name: setting.user.name,
        slug: setting.user.slug,
        timezone,
        ccEmail: setting.ccEmail,
        digestDay: setting.digestDay,
      } satisfies WeeklyDigestTarget;
    })
    .filter((target): target is WeeklyDigestTarget => Boolean(target));
}

async function getWeeklyDigestData(target: WeeklyDigestTarget, now: Date): Promise<WeeklyDigestData> {
  const windowEnd = now;
  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - 7);

  const [clickCountRows, activeLinksRows, brokenLinksRows, topLinksRows] = await Promise.all([
    db
      .select({ count: count(linkClicks.id) })
      .from(linkClicks)
      .innerJoin(links, eq(linkClicks.linkId, links.id))
      .where(
        and(
          eq(links.userId, target.userId),
          isNull(links.deletedAt),
          gte(linkClicks.clickedAt, windowStart),
        ),
      ),
    db
      .select({
        activeLinksCount: sql<number>`count(*)::int`,
      })
      .from(links)
      .where(
        and(
          eq(links.userId, target.userId),
          isNull(links.deletedAt),
          eq(links.isEnabled, true),
        ),
      ),
    db
      .select({
        slug: links.slug,
        productName: products.name,
        statusCode: links.lastStatusCode,
        lastCheckedAt: links.lastCheckedAt,
      })
      .from(links)
      .innerJoin(products, eq(links.productId, products.id))
      .where(
        and(
          eq(links.userId, target.userId),
          isNull(links.deletedAt),
          eq(links.isEnabled, true),
          eq(links.status, 'broken'),
        ),
      )
      .orderBy(desc(links.lastCheckedAt), asc(links.slug))
      .limit(10),
    db
      .select({
        slug: links.slug,
        productName: products.name,
        clicks: sql<number>`count(${linkClicks.id})::int`,
      })
      .from(links)
      .innerJoin(products, eq(links.productId, products.id))
      .leftJoin(
        linkClicks,
        and(eq(linkClicks.linkId, links.id), gte(linkClicks.clickedAt, windowStart)),
      )
      .where(and(eq(links.userId, target.userId), isNull(links.deletedAt)))
      .groupBy(links.id, links.slug, products.name)
      .orderBy(desc(sql`count(${linkClicks.id})`), asc(links.slug))
      .limit(5),
  ]);

  const totalClicks = clickCountRows[0]?.count ?? 0;
  const activeLinksCount = activeLinksRows[0]?.activeLinksCount ?? 0;
  const brokenLinks = brokenLinksRows.map((item) => ({
    slug: item.slug,
    productName: item.productName,
    shortUrl: buildShortLinkUrl(target.slug, item.slug),
    statusCode: item.statusCode,
    lastCheckedAt: item.lastCheckedAt,
  }));
  const topLinks = topLinksRows
    .filter((item) => item.clicks > 0)
    .map((item) => ({
      slug: item.slug,
      productName: item.productName,
      shortUrl: buildShortLinkUrl(target.slug, item.slug),
      clicks: item.clicks,
    }));

  return {
    activeLinksCount,
    brokenLinksCount: brokenLinks.length,
    totalClicks,
    topLinks,
    brokenLinks,
    periodLabel: formatPeriodLabel(windowStart, windowEnd, target.timezone),
  };
}

function buildWeeklyDigestEmail(target: WeeklyDigestTarget, data: WeeklyDigestData) {
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/links`;
  const subject = `Your weekly AffProf summary`;

  const topLinksText =
    data.topLinks.length > 0
      ? data.topLinks
          .map(
            (link, index) =>
              `${index + 1}. /${link.slug} (${link.productName}) - ${link.clicks} clicks`,
          )
          .join('\n')
      : 'No clicks recorded this week.';

  const brokenLinksText =
    data.brokenLinks.length > 0
      ? data.brokenLinks
          .map((link) => {
            const status = link.statusCode ? `status ${link.statusCode}` : 'status unavailable';
            return `- /${link.slug} (${link.productName}) - ${status}`;
          })
          .join('\n')
      : 'No broken links right now.';

  const text = [
    `Hi ${target.name},`,
    '',
    `Here is your AffProf weekly summary for ${data.periodLabel}.`,
    '',
    `Total clicks: ${data.totalClicks}`,
    `Active links: ${data.activeLinksCount}`,
    `Broken links: ${data.brokenLinksCount}`,
    '',
    'Top links:',
    topLinksText,
    '',
    'Broken links:',
    brokenLinksText,
    '',
    `Open dashboard: ${dashboardUrl}`,
  ].join('\n');

  const topLinksRows =
    data.topLinks.length > 0
      ? data.topLinks
          .map(
            (link) => `
              <tr>
                <td style="padding:8px 12px 8px 0"><strong>/${escapeHtml(link.slug)}</strong></td>
                <td style="padding:8px 12px 8px 0">${escapeHtml(link.productName)}</td>
                <td style="padding:8px 0 8px 0">${link.clicks}</td>
              </tr>
            `,
          )
          .join('')
      : `
          <tr>
            <td colspan="3" style="padding:8px 0;color:#6b7280">No clicks recorded this week.</td>
          </tr>
        `;

  const brokenLinksRows =
    data.brokenLinks.length > 0
      ? data.brokenLinks
          .map(
            (link) => `
              <tr>
                <td style="padding:8px 12px 8px 0"><strong>/${escapeHtml(link.slug)}</strong></td>
                <td style="padding:8px 12px 8px 0">${escapeHtml(link.productName)}</td>
                <td style="padding:8px 0 8px 0">${escapeHtml(link.statusCode ? `${link.statusCode}` : 'Unavailable')}</td>
              </tr>
            `,
          )
          .join('')
      : `
          <tr>
            <td colspan="3" style="padding:8px 0;color:#6b7280">No broken links right now.</td>
          </tr>
        `;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827">
      <p>Hi ${escapeHtml(target.name)},</p>
      <p>Here is your AffProf weekly summary for <strong>${escapeHtml(data.periodLabel)}</strong>.</p>

      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:20px 0">
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px"><div style="color:#6b7280;font-size:12px">Total clicks</div><div style="font-size:24px;font-weight:700">${data.totalClicks}</div></div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px"><div style="color:#6b7280;font-size:12px">Active links</div><div style="font-size:24px;font-weight:700">${data.activeLinksCount}</div></div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px"><div style="color:#6b7280;font-size:12px">Broken links</div><div style="font-size:24px;font-weight:700">${data.brokenLinksCount}</div></div>
      </div>

      <h3 style="margin:24px 0 8px">Top links</h3>
      <table style="border-collapse:collapse;width:100%">
        <thead>
          <tr>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Link</th>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Product</th>
            <th align="left" style="padding:8px 0 8px 0;color:#6b7280;font-weight:600">Clicks</th>
          </tr>
        </thead>
        <tbody>${topLinksRows}</tbody>
      </table>

      <h3 style="margin:24px 0 8px">Broken links</h3>
      <table style="border-collapse:collapse;width:100%">
        <thead>
          <tr>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Link</th>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Product</th>
            <th align="left" style="padding:8px 0 8px 0;color:#6b7280;font-weight:600">Status</th>
          </tr>
        </thead>
        <tbody>${brokenLinksRows}</tbody>
      </table>

      <p style="margin-top:24px"><a href="${dashboardUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#22c55e;color:#ffffff;text-decoration:none">Open dashboard</a></p>
    </div>
  `;

  return { subject, text, html };
}

async function sendWeeklyDigest(target: WeeklyDigestTarget, data: WeeklyDigestData, now: Date) {
  const message = buildWeeklyDigestEmail(target, data);
  const dedupeKey = `weekly:${formatLocalDateKey(now, target.timezone)}`;

  return sendTrackedEmailNotification({
    userId: target.userId,
    type: 'weekly_digest',
    dedupeKey,
    toEmail: target.email,
    ccEmail: target.ccEmail ?? null,
    subject: message.subject,
    payload: {
      kind: 'weekly_digest',
      periodLabel: data.periodLabel,
      totalClicks: data.totalClicks,
      activeLinksCount: data.activeLinksCount,
      brokenLinksCount: data.brokenLinksCount,
      topLinks: data.topLinks,
      brokenLinks: data.brokenLinks,
    },
    send: () =>
      sendResendEmail({
        from: env.RESEND_FROM_EMAIL!,
        to: [target.email],
        cc: target.ccEmail ? [target.ccEmail] : undefined,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
  });
}

export async function runScheduledWeeklyDigests(now = new Date()): Promise<WeeklyDigestRunResult> {
  if (!canSendResendEmail()) {
    return {
      eligibleUsers: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
    };
  }

  const targets = await getWeeklyDigestTargets(now);
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const target of targets) {
    try {
      const data = await getWeeklyDigestData(target, now);
      const hasActivity = data.totalClicks > 0 || data.brokenLinksCount > 0;

      if (!hasActivity) {
        skippedCount += 1;
        continue;
      }

      const result = await sendWeeklyDigest(target, data, now);
      if (result.skipped) {
        skippedCount += 1;
      } else {
        sentCount += 1;
      }
    } catch (error) {
      failedCount += 1;
      console.error(`[weekly-digest][${target.userId}]`, error);
    }
  }

  return {
    eligibleUsers: targets.length,
    sentCount,
    skippedCount,
    failedCount,
  };
}
