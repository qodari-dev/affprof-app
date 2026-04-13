import {
  BrokenLink,
  BrowserBreakdown,
  DashboardAnalytics,
  DashboardKpis,
  DeviceBreakdown,
  LinkAnalytics,
  PeakDay,
  RANGE_DAYS,
  RecentClick,
  TimeseriesPoint,
  TopCountry,
  TopLink,
  TopProduct,
  TrafficSource,
  UtmCampaign,
} from '@/schemas/analytics';
import { db, links } from '@/server/db';
import { getAuthContext } from '@/server/utils/auth-context';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { tsr } from '@ts-rest/serverless/next';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { contract } from '../contracts';

// ============================================
// HELPERS
// ============================================

function computeTrend(current: number, previous: number) {
  const diff = current - previous;
  const diffPercent = previous === 0 ? null : (diff / previous) * 100;
  return { value: current, previousValue: previous, diff, diffPercent };
}

function fillTimeseriesGaps(
  rows: { date: string; clicks: number }[],
  from: Date,
  to: Date
): TimeseriesPoint[] {
  const map = new Map(rows.map((r) => [r.date, r.clicks]));
  const result: TimeseriesPoint[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    result.push({ date: iso, clicks: map.get(iso) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

// ============================================
// HANDLER
// ============================================

export const analytics = tsr.router(contract.analytics, {
  dashboard: async ({ query }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const { productId = null, range } = query;

      const now = new Date();
      const days = RANGE_DAYS[range];
      const currentStart = new Date(now);
      currentStart.setUTCDate(currentStart.getUTCDate() - days);
      const previousStart = new Date(now);
      previousStart.setUTCDate(previousStart.getUTCDate() - days * 2);

      // Reusable filter fragments
      const userId = auth.userId;
      const productFilter = productId
        ? sql`AND l.product_id = ${productId}`
        : sql``;

      const productFilterForProducts = productId
        ? sql`AND p.id = ${productId}`
        : sql``;

      const [
        clicksAggResult,
        linksCountResult,
        timeseriesResult,
        topLinksResult,
        topProductsResult,
        sourcesResult,
        countriesResult,
        brokenLinksResult,
      ] = await Promise.all([
        // ---- Clicks aggregations (current, previous, mobile, qr) ----
        db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${currentStart})::int AS current_clicks,
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${previousStart} AND lc.clicked_at < ${currentStart})::int AS previous_clicks,
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${currentStart} AND lc.device = 'mobile')::int AS mobile_clicks,
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${currentStart} AND lc.is_qr = true)::int AS qr_clicks
          FROM link_clicks lc
          INNER JOIN links l ON l.id = lc.link_id
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
            AND lc.clicked_at >= ${previousStart}
        `),

        // ---- Links count by status ----
        db.execute(sql`
          SELECT status, COUNT(*)::int AS count
          FROM links l
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
          GROUP BY status
        `),

        // ---- Timeseries: clicks per day (current period) ----
        db.execute(sql`
          SELECT
            to_char(date_trunc('day', lc.clicked_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          INNER JOIN links l ON l.id = lc.link_id
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY date_trunc('day', lc.clicked_at)
          ORDER BY date_trunc('day', lc.clicked_at) ASC
        `),

        // ---- Top links with current + previous clicks ----
        db.execute(sql`
          SELECT
            l.id,
            l.slug,
            l.platform,
            l.product_id,
            p.name AS product_name,
            COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${currentStart})::int AS current_clicks,
            COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${previousStart} AND lc.clicked_at < ${currentStart})::int AS previous_clicks
          FROM links l
          INNER JOIN products p ON p.id = l.product_id
          LEFT JOIN link_clicks lc
            ON lc.link_id = l.id AND lc.clicked_at >= ${previousStart}
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
          GROUP BY l.id, p.name
          HAVING COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${currentStart}) > 0
          ORDER BY current_clicks DESC
          LIMIT 5
        `),

        // ---- Top products with current + previous clicks ----
        db.execute(sql`
          SELECT
            p.id,
            p.name,
            COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${currentStart})::int AS current_clicks,
            COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${previousStart} AND lc.clicked_at < ${currentStart})::int AS previous_clicks
          FROM products p
          LEFT JOIN links l
            ON l.product_id = p.id AND l.deleted_at IS NULL
          LEFT JOIN link_clicks lc
            ON lc.link_id = l.id AND lc.clicked_at >= ${previousStart}
          WHERE p.user_id = ${userId}
            AND p.deleted_at IS NULL
            ${productFilterForProducts}
          GROUP BY p.id, p.name
          HAVING COUNT(lc.id) FILTER (WHERE lc.clicked_at >= ${currentStart}) > 0
          ORDER BY current_clicks DESC
          LIMIT 5
        `),

        // ---- Traffic sources ----
        db.execute(sql`
          SELECT
            COALESCE(NULLIF(lc.referrer_source, ''), 'direct') AS source,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          INNER JOIN links l ON l.id = lc.link_id
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY COALESCE(NULLIF(lc.referrer_source, ''), 'direct')
          ORDER BY clicks DESC
          LIMIT 6
        `),

        // ---- Top countries ----
        db.execute(sql`
          SELECT
            lc.country AS code,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          INNER JOIN links l ON l.id = lc.link_id
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            ${productFilter}
            AND lc.clicked_at >= ${currentStart}
            AND lc.country IS NOT NULL
          GROUP BY lc.country
          ORDER BY clicks DESC
          LIMIT 10
        `),

        // ---- Broken links ----
        db.execute(sql`
          SELECT
            l.id,
            l.slug,
            l.product_id,
            p.name AS product_name,
            l.last_checked_at,
            l.consecutive_failures
          FROM links l
          INNER JOIN products p ON p.id = l.product_id
          WHERE l.user_id = ${userId}
            AND l.deleted_at IS NULL
            AND l.status = 'broken'
            ${productFilter}
          ORDER BY l.last_checked_at DESC NULLS LAST
          LIMIT 10
        `),
      ]);

      // ---- KPIs: clicks + mobile + QR share ----
      const clicksRow = clicksAggResult.rows[0] as
        | {
            current_clicks: number;
            previous_clicks: number;
            mobile_clicks: number;
            qr_clicks: number;
          }
        | undefined;
      const currentClicks = clicksRow?.current_clicks ?? 0;
      const previousClicks = clicksRow?.previous_clicks ?? 0;
      const mobileClicks = clicksRow?.mobile_clicks ?? 0;
      const qrClicks = clicksRow?.qr_clicks ?? 0;
      const mobileShare =
        currentClicks > 0 ? (mobileClicks / currentClicks) * 100 : 0;
      const qrShare = currentClicks > 0 ? (qrClicks / currentClicks) * 100 : 0;

      // ---- KPIs: links count ----
      const linksRows = linksCountResult.rows as { status: string; count: number }[];
      const linksCounts = {
        total: 0,
        active: 0,
        broken: 0,
        unknown: 0,
      };
      for (const row of linksRows) {
        linksCounts.total += row.count;
        if (row.status === 'active') linksCounts.active = row.count;
        if (row.status === 'broken') linksCounts.broken = row.count;
        if (row.status === 'unknown') linksCounts.unknown = row.count;
      }

      // ---- Timeseries with gap filling ----
      const timeseriesRaw = timeseriesResult.rows as {
        date: string;
        clicks: number;
      }[];
      const timeseries = fillTimeseriesGaps(timeseriesRaw, currentStart, now);

      // ---- Peak day (derived from timeseries) ----
      let peakDay: PeakDay | null = null;
      for (const point of timeseries) {
        if (point.clicks > 0 && (!peakDay || point.clicks > peakDay.clicks)) {
          peakDay = { date: point.date, clicks: point.clicks };
        }
      }

      // ---- Top links ----
      const topLinksRaw = topLinksResult.rows as {
        id: string;
        slug: string;
        platform: string;
        product_id: string;
        product_name: string;
        current_clicks: number;
        previous_clicks: number;
      }[];
      const topLinks: TopLink[] = topLinksRaw.map((r) => ({
        id: r.id,
        slug: r.slug,
        platform: r.platform,
        productId: r.product_id,
        productName: r.product_name,
        clicks: r.current_clicks,
        previousClicks: r.previous_clicks,
        diffPercent:
          r.previous_clicks === 0
            ? null
            : ((r.current_clicks - r.previous_clicks) / r.previous_clicks) * 100,
      }));

      // ---- Top products ----
      const topProductsRaw = topProductsResult.rows as {
        id: string;
        name: string;
        current_clicks: number;
        previous_clicks: number;
      }[];
      const topProducts: TopProduct[] = topProductsRaw.map((r) => ({
        id: r.id,
        name: r.name,
        clicks: r.current_clicks,
        previousClicks: r.previous_clicks,
        diffPercent:
          r.previous_clicks === 0
            ? null
            : ((r.current_clicks - r.previous_clicks) / r.previous_clicks) * 100,
      }));

      // ---- Traffic sources ----
      const sourcesRaw = sourcesResult.rows as { source: string; clicks: number }[];
      const totalSourceClicks = sourcesRaw.reduce((acc, r) => acc + r.clicks, 0);
      const trafficSources: TrafficSource[] = sourcesRaw.map((r) => ({
        source: r.source,
        clicks: r.clicks,
        percentage:
          totalSourceClicks > 0 ? (r.clicks / totalSourceClicks) * 100 : 0,
      }));

      // ---- Top countries ----
      const countriesRaw = countriesResult.rows as {
        code: string;
        clicks: number;
      }[];
      const totalCountryClicks = countriesRaw.reduce((acc, r) => acc + r.clicks, 0);
      const topCountries: TopCountry[] = countriesRaw.map((r) => ({
        code: r.code,
        clicks: r.clicks,
        percentage:
          totalCountryClicks > 0 ? (r.clicks / totalCountryClicks) * 100 : 0,
      }));

      // ---- Broken links ----
      const brokenLinksRaw = brokenLinksResult.rows as {
        id: string;
        slug: string;
        product_id: string;
        product_name: string;
        last_checked_at: string | null;
        consecutive_failures: number;
      }[];
      const brokenLinks: BrokenLink[] = brokenLinksRaw.map((r) => ({
        id: r.id,
        slug: r.slug,
        productId: r.product_id,
        productName: r.product_name,
        lastCheckedAt: r.last_checked_at,
        consecutiveFailures: r.consecutive_failures,
      }));

      // ---- Assemble ----
      const kpis: DashboardKpis = {
        clicks: computeTrend(currentClicks, previousClicks),
        links: linksCounts,
        topCountry: topCountries[0]
          ? {
              code: topCountries[0].code,
              clicks: topCountries[0].clicks,
              percentage: topCountries[0].percentage,
            }
          : null,
        mobileShare,
        qrShare,
      };

      const body: DashboardAnalytics = {
        range,
        productId: productId ?? null,
        periodStart: currentStart.toISOString(),
        periodEnd: now.toISOString(),
        kpis,
        timeseries,
        peakDay,
        topLinks,
        topProducts,
        trafficSources,
        topCountries,
        brokenLinks,
      };

      return { status: 200, body };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error loading dashboard analytics',
      });
    }
  },

  // ==========================================
  // LINK ANALYTICS - GET /analytics/link/:id
  // ==========================================
  link: async ({ params: { id }, query }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const { range } = query;

      // Verify ownership
      const linkRow = await db.query.links.findFirst({
        where: and(
          eq(links.id, id),
          eq(links.userId, auth.userId),
          isNull(links.deletedAt)
        ),
        columns: { id: true },
      });

      if (!linkRow) {
        throwHttpError({ status: 404, message: 'Link not found', code: 'NOT_FOUND' });
      }

      const now = new Date();
      const days = RANGE_DAYS[range];
      const currentStart = new Date(now);
      currentStart.setUTCDate(currentStart.getUTCDate() - days);
      const previousStart = new Date(now);
      previousStart.setUTCDate(previousStart.getUTCDate() - days * 2);

      const [
        clicksAggResult,
        timeseriesResult,
        countriesResult,
        devicesResult,
        browsersResult,
        sourcesResult,
        utmCampaignsResult,
        recentClicksResult,
      ] = await Promise.all([
        // ---- Aggregates: total, previous, QR ----
        db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${currentStart})::int AS current_clicks,
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${previousStart} AND lc.clicked_at < ${currentStart})::int AS previous_clicks,
            COUNT(*) FILTER (WHERE lc.clicked_at >= ${currentStart} AND lc.is_qr = true)::int AS qr_clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${previousStart}
        `),

        // ---- Timeseries ----
        db.execute(sql`
          SELECT
            to_char(date_trunc('day', lc.clicked_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY date_trunc('day', lc.clicked_at)
          ORDER BY date_trunc('day', lc.clicked_at) ASC
        `),

        // ---- Countries ----
        db.execute(sql`
          SELECT lc.country AS code, COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
            AND lc.country IS NOT NULL
          GROUP BY lc.country
          ORDER BY clicks DESC
          LIMIT 10
        `),

        // ---- Devices ----
        db.execute(sql`
          SELECT
            COALESCE(lc.device::text, 'unknown') AS device,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY lc.device
          ORDER BY clicks DESC
        `),

        // ---- Browsers ----
        db.execute(sql`
          SELECT
            COALESCE(NULLIF(lc.browser, ''), 'Unknown') AS browser,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY COALESCE(NULLIF(lc.browser, ''), 'Unknown')
          ORDER BY clicks DESC
          LIMIT 8
        `),

        // ---- Traffic sources ----
        db.execute(sql`
          SELECT
            COALESCE(NULLIF(lc.referrer_source, ''), 'direct') AS source,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
          GROUP BY COALESCE(NULLIF(lc.referrer_source, ''), 'direct')
          ORDER BY clicks DESC
          LIMIT 6
        `),

        // ---- UTM campaigns (top campaigns with source/medium) ----
        db.execute(sql`
          SELECT
            lc.utm_campaign AS campaign,
            lc.utm_source AS source,
            lc.utm_medium AS medium,
            COUNT(*)::int AS clicks
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
            AND lc.clicked_at >= ${currentStart}
            AND lc.utm_campaign IS NOT NULL
            AND lc.utm_campaign != ''
          GROUP BY lc.utm_campaign, lc.utm_source, lc.utm_medium
          ORDER BY clicks DESC
          LIMIT 10
        `),

        // ---- Recent clicks (latest 50) ----
        db.execute(sql`
          SELECT
            lc.id,
            lc.clicked_at,
            lc.country,
            lc.city,
            lc.device::text,
            lc.browser,
            lc.referrer_source,
            lc.is_qr
          FROM link_clicks lc
          WHERE lc.link_id = ${id}
          ORDER BY lc.clicked_at DESC
          LIMIT 50
        `),
      ]);

      // ---- Process clicks aggregate ----
      const aggRow = clicksAggResult.rows[0] as
        | { current_clicks: number; previous_clicks: number; qr_clicks: number }
        | undefined;
      const totalClicks = aggRow?.current_clicks ?? 0;
      const previousClicks = aggRow?.previous_clicks ?? 0;
      const qrClicks = aggRow?.qr_clicks ?? 0;
      const diffPercent =
        previousClicks === 0 ? null : ((totalClicks - previousClicks) / previousClicks) * 100;
      const qrShare = totalClicks > 0 ? (qrClicks / totalClicks) * 100 : 0;

      // ---- Timeseries with gap filling ----
      const tsRaw = timeseriesResult.rows as { date: string; clicks: number }[];
      const timeseries = fillTimeseriesGaps(tsRaw, currentStart, now);

      let peakDay: PeakDay | null = null;
      for (const point of timeseries) {
        if (point.clicks > 0 && (!peakDay || point.clicks > peakDay.clicks)) {
          peakDay = { date: point.date, clicks: point.clicks };
        }
      }

      // ---- Countries ----
      const countriesRaw = countriesResult.rows as { code: string; clicks: number }[];
      const totalCountryClicks = countriesRaw.reduce((a, r) => a + r.clicks, 0);
      const countries: TopCountry[] = countriesRaw.map((r) => ({
        code: r.code,
        clicks: r.clicks,
        percentage: totalCountryClicks > 0 ? (r.clicks / totalCountryClicks) * 100 : 0,
      }));

      // ---- Devices ----
      const devicesRaw = devicesResult.rows as { device: string; clicks: number }[];
      const totalDeviceClicks = devicesRaw.reduce((a, r) => a + r.clicks, 0);
      const devices: DeviceBreakdown[] = devicesRaw.map((r) => ({
        device: r.device,
        clicks: r.clicks,
        percentage: totalDeviceClicks > 0 ? (r.clicks / totalDeviceClicks) * 100 : 0,
      }));

      // ---- Browsers ----
      const browsersRaw = browsersResult.rows as { browser: string; clicks: number }[];
      const totalBrowserClicks = browsersRaw.reduce((a, r) => a + r.clicks, 0);
      const browsers: BrowserBreakdown[] = browsersRaw.map((r) => ({
        browser: r.browser,
        clicks: r.clicks,
        percentage: totalBrowserClicks > 0 ? (r.clicks / totalBrowserClicks) * 100 : 0,
      }));

      // ---- Sources ----
      const sourcesRaw = sourcesResult.rows as { source: string; clicks: number }[];
      const totalSourceClicks = sourcesRaw.reduce((a, r) => a + r.clicks, 0);
      const sources: TrafficSource[] = sourcesRaw.map((r) => ({
        source: r.source,
        clicks: r.clicks,
        percentage: totalSourceClicks > 0 ? (r.clicks / totalSourceClicks) * 100 : 0,
      }));

      // ---- UTM campaigns ----
      const utmRaw = utmCampaignsResult.rows as {
        campaign: string;
        source: string | null;
        medium: string | null;
        clicks: number;
      }[];
      const totalUtmClicks = utmRaw.reduce((a, r) => a + r.clicks, 0);
      const utmCampaigns: UtmCampaign[] = utmRaw.map((r) => ({
        campaign: r.campaign,
        source: r.source,
        medium: r.medium,
        clicks: r.clicks,
        percentage: totalUtmClicks > 0 ? (r.clicks / totalUtmClicks) * 100 : 0,
      }));

      // ---- Recent clicks ----
      const recentRaw = recentClicksResult.rows as {
        id: string;
        clicked_at: string;
        country: string | null;
        city: string | null;
        device: string | null;
        browser: string | null;
        referrer_source: string | null;
        is_qr: boolean;
      }[];
      const recentClicks: RecentClick[] = recentRaw.map((r) => ({
        id: r.id,
        clickedAt: r.clicked_at,
        country: r.country,
        city: r.city,
        device: r.device,
        browser: r.browser,
        referrerSource: r.referrer_source,
        isQr: r.is_qr,
      }));

      const body: LinkAnalytics = {
        linkId: id,
        range,
        periodStart: currentStart.toISOString(),
        periodEnd: now.toISOString(),
        totalClicks,
        previousClicks,
        diffPercent,
        qrClicks,
        qrShare,
        timeseries,
        peakDay,
        countries,
        devices,
        browsers,
        sources,
        utmCampaigns,
        recentClicks,
      };

      return { status: 200, body };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error loading link analytics',
      });
    }
  },
});
