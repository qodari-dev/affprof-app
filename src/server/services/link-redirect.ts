import { createHash } from 'crypto';

import { after, type NextRequest } from 'next/server';
import { and, eq, isNull, sql } from 'drizzle-orm';
import geoip from 'geoip-lite';

import { db, customDomains, linkClicks, links, userSettings, users } from '@/server/db';
import { getClientIp } from '@/server/utils/get-client-ip';
import { checkInMemoryRateLimit } from '@/server/utils/in-memory-rate-limit';

const REDIRECT_RATE_LIMIT_WINDOW_MS = 60_000;
const REDIRECT_IP_LIMIT_PER_MINUTE = 300;
const REDIRECT_IP_LINK_LIMIT_PER_MINUTE = 120;
const CLICK_ANALYTICS_DEDUPE_WINDOW_MS = 10_000;

function hashRateLimitKey(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function rateLimitResponse(retryAfterSeconds: number) {
  return new Response('Too many requests', {
    status: 429,
    headers: {
      'Retry-After': String(retryAfterSeconds),
      'Cache-Control': 'no-store',
    },
  });
}

function checkRedirectRateLimit(request: NextRequest, linkKey: string) {
  const ip = getClientIp(request);
  if (ip === 'unknown') return null;

  const ipKey = hashRateLimitKey(ip);
  const linkKeyHash = hashRateLimitKey(linkKey);

  const globalLimit = checkInMemoryRateLimit(
    `redirect:ip:${ipKey}`,
    REDIRECT_IP_LIMIT_PER_MINUTE,
    REDIRECT_RATE_LIMIT_WINDOW_MS,
  );

  if (!globalLimit.allowed) {
    return rateLimitResponse(globalLimit.retryAfterSeconds);
  }

  const linkLimit = checkInMemoryRateLimit(
    `redirect:ip-link:${ipKey}:${linkKeyHash}`,
    REDIRECT_IP_LINK_LIMIT_PER_MINUTE,
    REDIRECT_RATE_LIMIT_WINDOW_MS,
  );

  if (!linkLimit.allowed) {
    return rateLimitResponse(linkLimit.retryAfterSeconds);
  }

  return null;
}

function shouldTrackClickAnalytics(linkId: string, ip: string | null) {
  if (!ip) return true;

  return checkInMemoryRateLimit(
    `click-dedupe:${linkId}:${hashIp(ip)}`,
    1,
    CLICK_ANALYTICS_DEDUPE_WINDOW_MS,
  ).allowed;
}

function parseDevice(ua: string): 'mobile' | 'desktop' | 'tablet' {
  const lower = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(lower)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(lower)) return 'mobile';
  return 'desktop';
}

function parseOs(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'other';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'other';
}

function parseReferrerSource(referrer: string | null): string {
  if (!referrer) return 'direct';
  const lower = referrer.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('reddit.com')) return 'reddit';
  if (lower.includes('pinterest.com')) return 'pinterest';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('google.com')) return 'google';
  return 'other';
}

function pickFirstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = headers.get(name)?.trim();
    if (value) return value;
  }

  return null;
}

function normalizeGeoValue(value: string | null, maxLength: number) {
  if (!value) return null;

  const normalized = value.trim().slice(0, maxLength);
  return normalized.length > 0 ? normalized : null;
}

function parseGeoHeaders(headers: Headers) {
  const country = normalizeGeoValue(
    pickFirstHeader(headers, [
      'x-vercel-ip-country',
      'cf-ipcountry',
      'x-geo-country',
      'x-country',
    ]),
    100,
  );

  const city = normalizeGeoValue(
    pickFirstHeader(headers, [
      'x-vercel-ip-city',
      'x-geo-city',
      'x-city',
    ]),
    120,
  );

  return { country: country?.toUpperCase() ?? null, city };
}

function geoLookupByIp(ip: string): { country: string | null; city: string | null } {
  const geo = geoip.lookup(ip);
  if (geo) {
    return {
      country: geo.country?.toUpperCase() ?? null,
      city: normalizeGeoValue(geo.city ?? null, 120),
    };
  }
  return { country: null, city: null };
}

function buildRedirectUrl(originalUrl: string, searchParams: URLSearchParams) {
  const destination = new URL(originalUrl);

  for (const [key, value] of searchParams.entries()) {
    if (key === 'qr') continue;
    if (destination.searchParams.has(key)) continue;
    destination.searchParams.append(key, value);
  }

  return destination.toString();
}

function normalizeRequestHostname(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host')
    ?? request.headers.get('host')
    ?? request.nextUrl.host;

  return host.trim().toLowerCase().replace(/:\d+$/, '');
}

async function findRedirectableLink(userId: string, linkSlug: string) {
  return db.query.links.findFirst({
    where: and(
      eq(links.userId, userId),
      eq(links.slug, linkSlug),
      isNull(links.deletedAt),
    ),
    columns: {
      id: true,
      originalUrl: true,
      fallbackUrl: true,
      status: true,
      isEnabled: true,
    },
  });
}

async function getDefaultFallbackUrl(userId: string) {
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
    columns: {
      defaultFallbackUrl: true,
    },
  });

  return settings?.defaultFallbackUrl ?? null;
}

function resolveRedirectTarget(link: {
  originalUrl: string;
  fallbackUrl: string | null;
  defaultFallbackUrl: string | null;
  status: 'active' | 'broken' | 'unknown';
  isEnabled: boolean;
}) {
  const shouldUseFallback = !link.isEnabled || link.status === 'broken';
  const fallbackUrl = link.fallbackUrl ?? link.defaultFallbackUrl;

  if (shouldUseFallback) {
    return fallbackUrl
      ? { destinationUrl: fallbackUrl, usedFallback: true }
      : null;
  }

  return {
    destinationUrl: link.originalUrl,
    usedFallback: false,
  };
}

async function redirectToLink(
  request: NextRequest,
  link: {
    id: string;
    originalUrl: string;
    fallbackUrl: string | null;
    defaultFallbackUrl: string | null;
    status: 'active' | 'broken' | 'unknown';
    isEnabled: boolean;
  },
) {
  const target = resolveRedirectTarget(link);

  const ua = request.headers.get('user-agent') ?? '';
  const referrer = request.headers.get('referer') ?? null;
  const clientIp = getClientIp(request);
  const ip = clientIp === 'unknown' ? null : clientIp;

  const { searchParams } = request.nextUrl;
  const isQr = searchParams.get('qr') === '1';
  const utmSource = searchParams.get('utm_source') ?? null;
  const utmMedium = searchParams.get('utm_medium') ?? null;
  const utmCampaign = searchParams.get('utm_campaign') ?? null;
  const utmContent = searchParams.get('utm_content') ?? null;
  const utmTerm = searchParams.get('utm_term') ?? null;
  const geoFromHeaders = parseGeoHeaders(request.headers);

  if (shouldTrackClickAnalytics(link.id, ip)) {
    after(async () => {
      try {
        const { country, city } = geoFromHeaders.country
          ? geoFromHeaders
          : ip ? geoLookupByIp(ip) : { country: null, city: null };

        await db.transaction(async (tx) => {
          await tx.insert(linkClicks).values({
            linkId: link.id,
            country,
            city,
            device: parseDevice(ua),
            os: parseOs(ua),
            browser: parseBrowser(ua),
            userAgent: ua.slice(0, 512),
            referrer: referrer?.slice(0, 2048) ?? null,
            referrerSource: parseReferrerSource(referrer),
            isQr,
            usedFallback: target?.usedFallback ?? false,
            failed: target === null,
            ipHash: ip ? hashIp(ip) : null,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
            utmTerm,
          });

          await tx
            .update(links)
            .set({ totalClicks: sql`${links.totalClicks} + 1` })
            .where(eq(links.id, link.id));
        });
      } catch (err) {
        console.error('[redirect] click tracking failed:', err);
      }
    });
  }

  if (!target) {
    return Response.redirect(new URL('/link-unavailable', request.url), 302);
  }

  const redirectUrl = buildRedirectUrl(target.destinationUrl, searchParams);
  return Response.redirect(redirectUrl, 302);
}

export async function handleDefaultShortLinkRedirect(
  request: NextRequest,
  input: { userSlug: string; linkSlug: string },
) {
  const rateLimited = checkRedirectRateLimit(
    request,
    `default:${input.userSlug}:${input.linkSlug}`,
  );
  if (rateLimited) return rateLimited;

  const user = await db.query.users.findFirst({
    where: eq(users.slug, input.userSlug),
    columns: { id: true },
  });

  if (!user) {
    return new Response('Not found', { status: 404 });
  }

  const link = await findRedirectableLink(user.id, input.linkSlug);
  if (!link) {
    return new Response('Not found', { status: 404 });
  }

  // Only fetch default fallback if we actually need it
  const needsFallback = !link.isEnabled || link.status === 'broken';
  const defaultFallbackUrl = needsFallback && !link.fallbackUrl
    ? await getDefaultFallbackUrl(user.id)
    : null;

  return redirectToLink(request, { ...link, defaultFallbackUrl });
}

export async function handleCustomDomainRedirect(
  request: NextRequest,
  input: { linkSlug: string },
) {
  const hostname = normalizeRequestHostname(request);
  const rateLimited = checkRedirectRateLimit(request, `custom:${hostname}:${input.linkSlug}`);
  if (rateLimited) return rateLimited;

  const domain = await db.query.customDomains.findFirst({
    where: and(eq(customDomains.hostname, hostname), eq(customDomains.status, 'verified')),
    columns: {
      userId: true,
    },
  });

  if (!domain) {
    return new Response('Not found', { status: 404 });
  }

  const link = await findRedirectableLink(domain.userId, input.linkSlug);
  if (!link) {
    return new Response('Not found', { status: 404 });
  }

  const needsFallback = !link.isEnabled || link.status === 'broken';
  const defaultFallbackUrl = needsFallback && !link.fallbackUrl
    ? await getDefaultFallbackUrl(domain.userId)
    : null;

  return redirectToLink(request, { ...link, defaultFallbackUrl });
}
