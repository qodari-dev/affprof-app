import { env } from '@/env';
import { db, links, linkChecks } from '@/server/db';
import { BrokenLinkEmailItem, sendBrokenLinksAlert } from '@/server/services/link-alerts';
import { buildShortLinkUrl } from '@/utils/short-link';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';

// ============================================================================
// Types
// ============================================================================

export interface LinkCheckResult {
  linkId: string;
  statusCode: number | null;
  responseMs: number | null;
  isBroken: boolean;
  error?: string;
}

export interface ScheduledLinkCheckResult {
  batchSize: number;
  checkedCount: number;
  brokenCount: number;
  results: LinkCheckResult[];
}

type ScheduledEmailBucket = {
  userId: string;
  userEmail: string;
  userName: string;
  ccEmail: string | null;
  items: BrokenLinkEmailItem[];
};

type LinkCheckCandidate = {
  id: string;
  originalUrl: string;
  slug: string;
  status: 'active' | 'broken' | 'unknown';
  consecutiveFailures: number;
  product: {
    name: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    slug: string;
    customDomains?: Array<{
      hostname: string;
      isPrimary: boolean;
      status: 'pending' | 'verified';
    }>;
    settings: {
      emailOnBrokenLink: boolean;
      ccEmail: string | null;
    } | null;
  };
};

type EvaluatedLinkCheck = {
  result: LinkCheckResult;
  brokenEmailItem?: BrokenLinkEmailItem;
};

function getPrimaryCustomDomainHostname(candidate: LinkCheckCandidate) {
  return candidate.user.customDomains?.find(
    (domain) => domain.status === 'verified' && domain.isPrimary,
  )?.hostname;
}

// ============================================================================
// Core check function — reusable for single link, bulk, and cron
// ============================================================================

/**
 * Checks a single URL and returns the result.
 * Does NOT touch the database — caller decides what to persist.
 */
export async function checkUrl(
  url: string,
  timeoutMs = 10_000,
): Promise<{ statusCode: number | null; responseMs: number; isBroken: boolean; error?: string }> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AffProf Link Checker/1.0',
      },
    });

    clearTimeout(timeout);
    const responseMs = Date.now() - start;

    // Some servers reject HEAD, retry with GET
    if (response.status === 405) {
      const retryStart = Date.now();
      const retryController = new AbortController();
      const retryTimeout = setTimeout(() => retryController.abort(), timeoutMs);

      const retryResponse = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: retryController.signal,
        headers: {
          'User-Agent': 'AffProf Link Checker/1.0',
        },
      });

      clearTimeout(retryTimeout);
      const retryMs = Date.now() - retryStart;

      return {
        statusCode: retryResponse.status,
        responseMs: retryMs,
        isBroken: retryResponse.status >= 400,
      };
    }

    return {
      statusCode: response.status,
      responseMs,
      isBroken: response.status >= 400,
    };
  } catch (err) {
    const responseMs = Date.now() - start;
    const error = err instanceof Error ? err.message : 'Unknown error';

    return {
      statusCode: null,
      responseMs,
      isBroken: true,
      error,
    };
  }
}

// ============================================================================
// Persist a check result — saves to link_checks + updates link status
// ============================================================================

export async function persistCheckResult(
  linkId: string,
  result: ReturnType<typeof checkUrl> extends Promise<infer T> ? T : never,
): Promise<LinkCheckResult> {
  // Save check record
  await db.insert(linkChecks).values({
    linkId,
    statusCode: result.statusCode,
    responseMs: result.responseMs,
    isBroken: result.isBroken,
  });

  // Update link status
  const currentLink = await db.query.links.findFirst({
    where: eq(links.id, linkId),
    columns: { consecutiveFailures: true },
  });

  const consecutiveFailures = result.isBroken
    ? (currentLink?.consecutiveFailures ?? 0) + 1
    : 0;

  const status = result.isBroken
    ? (consecutiveFailures >= 2 ? 'broken' : 'unknown')
    : 'active';

  await db
    .update(links)
    .set({
      status,
      lastCheckedAt: new Date(),
      lastStatusCode: result.statusCode,
      lastResponseMs: result.responseMs,
      consecutiveFailures,
    })
    .where(eq(links.id, linkId));

  return {
    linkId,
    statusCode: result.statusCode,
    responseMs: result.responseMs,
    isBroken: result.isBroken,
    error: result.error,
  };
}

function buildBrokenEmailItem(
  candidate: LinkCheckCandidate,
  result: Awaited<ReturnType<typeof checkUrl>>,
): BrokenLinkEmailItem | undefined {
  const settings = candidate.user.settings;
  const isAlertEnabled = settings?.emailOnBrokenLink ?? true;
  const nextFailures = result.isBroken ? candidate.consecutiveFailures + 1 : 0;
  const willBeBroken = result.isBroken && nextFailures >= 2;

  if (!isAlertEnabled || !willBeBroken) {
    return undefined;
  }

  return {
    productName: candidate.product.name,
    linkSlug: candidate.slug,
    originalUrl: candidate.originalUrl,
    shortUrl: buildShortLinkUrl(
      candidate.user.slug,
      candidate.slug,
      getPrimaryCustomDomainHostname(candidate),
    ),
    statusCode: result.statusCode,
    responseMs: result.responseMs,
    state: candidate.status === 'broken' ? 'still_broken' : 'newly_broken',
  };
}

async function evaluateCandidate(candidate: LinkCheckCandidate): Promise<EvaluatedLinkCheck> {
  const result = await checkUrl(candidate.originalUrl);
  const persisted = await persistCheckResult(candidate.id, result);

  return {
    result: persisted,
    brokenEmailItem: buildBrokenEmailItem(candidate, result),
  };
}

async function sendScheduledBrokenLinkEmails(candidates: LinkCheckCandidate[], evaluations: EvaluatedLinkCheck[]) {
  const dedupeKey = `broken-links:${new Date().toISOString().slice(0, 13)}`;
  const grouped = new Map<string, ScheduledEmailBucket>();

  for (let index = 0; index < evaluations.length; index += 1) {
    const emailItem = evaluations[index]?.brokenEmailItem;
    const candidate = candidates[index];

    if (!emailItem || !candidate) continue;

    const existing = grouped.get(candidate.user.email);
    if (existing) {
      existing.items.push(emailItem);
      continue;
    }

    grouped.set(candidate.user.email, {
      userId: candidate.user.id,
      userEmail: candidate.user.email,
      userName: candidate.user.name,
      ccEmail: candidate.user.settings?.ccEmail ?? null,
      items: [emailItem],
    });
  }

  await Promise.all(
    [...grouped.values()].map((bucket) =>
      sendBrokenLinksAlert({
        userId: bucket.userId,
        userEmail: bucket.userEmail,
        userName: bucket.userName,
        ccEmail: bucket.ccEmail,
        dedupeKey,
        items: bucket.items,
      }),
    ),
  );
}

// ============================================================================
// High-level: check a single link (check + persist)
// ============================================================================

export async function checkLink(linkId: string): Promise<LinkCheckResult> {
  const link = await db.query.links.findFirst({
    where: eq(links.id, linkId),
    columns: {
      id: true,
      originalUrl: true,
      slug: true,
      status: true,
      consecutiveFailures: true,
    },
    with: {
      product: {
        columns: {
          name: true,
        },
      },
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
          slug: true,
        },
        with: {
          customDomains: {
            columns: {
              hostname: true,
              isPrimary: true,
              status: true,
            },
          },
          settings: {
            columns: {
              emailOnBrokenLink: true,
              ccEmail: true,
            },
          },
        },
      },
    },
  });

  if (!link) {
    throw new Error(`Link ${linkId} not found`);
  }

  const evaluation = await evaluateCandidate(link as LinkCheckCandidate);
  return evaluation.result;
}

// ============================================================================
// High-level: check multiple links (for product bulk check + cron)
// ============================================================================

export async function checkLinks(linkIds: string[]): Promise<LinkCheckResult[]> {
  const linksToCheck = await db.query.links.findMany({
    where: (fields, { inArray }) => inArray(fields.id, linkIds),
    columns: {
      id: true,
      originalUrl: true,
      slug: true,
      status: true,
      consecutiveFailures: true,
    },
    with: {
      product: {
        columns: {
          name: true,
        },
      },
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
          slug: true,
        },
        with: {
          customDomains: {
            columns: {
              hostname: true,
              isPrimary: true,
              status: true,
            },
          },
          settings: {
            columns: {
              emailOnBrokenLink: true,
              ccEmail: true,
            },
          },
        },
      },
    },
  });

  // Run checks in parallel with concurrency limit
  const CONCURRENCY = 5;
  const results: LinkCheckResult[] = [];

  for (let i = 0; i < linksToCheck.length; i += CONCURRENCY) {
    const batch = linksToCheck.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((link) => evaluateCandidate(link as LinkCheckCandidate)),
    );
    results.push(...batchResults.map((item) => item.result));
  }

  return results;
}

export async function getLinkIdsForScheduledCheck(limit = env.LINK_CHECKER_BATCH_SIZE): Promise<string[]> {
  const candidates = await db
    .select({ id: links.id })
    .from(links)
    .where(
      and(
        eq(links.isEnabled, true),
        isNull(links.deletedAt),
      ),
    )
    .orderBy(
      sql`case when ${links.lastCheckedAt} is null then 0 else 1 end`,
      asc(links.lastCheckedAt),
      asc(links.createdAt),
    )
    .limit(limit);

  return candidates.map((link) => link.id);
}

export async function runScheduledLinkChecks(
  limit = env.LINK_CHECKER_BATCH_SIZE,
): Promise<ScheduledLinkCheckResult> {
  const linkIds = await getLinkIdsForScheduledCheck(limit);

  if (linkIds.length === 0) {
    return {
      batchSize: limit,
      checkedCount: 0,
      brokenCount: 0,
      results: [],
    };
  }

  const linksToCheck = await db.query.links.findMany({
    where: (fields, { inArray }) => inArray(fields.id, linkIds),
    columns: {
      id: true,
      originalUrl: true,
      slug: true,
      status: true,
      consecutiveFailures: true,
    },
    with: {
      product: {
        columns: {
          name: true,
        },
      },
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
          slug: true,
        },
        with: {
          customDomains: {
            columns: {
              hostname: true,
              isPrimary: true,
              status: true,
            },
          },
          settings: {
            columns: {
              emailOnBrokenLink: true,
              ccEmail: true,
            },
          },
        },
      },
    },
  });

  const CONCURRENCY = 5;
  const evaluations: EvaluatedLinkCheck[] = [];

  for (let i = 0; i < linksToCheck.length; i += CONCURRENCY) {
    const batch = linksToCheck.slice(i, i + CONCURRENCY);
    const batchEvaluations = await Promise.all(
      batch.map((link) => evaluateCandidate(link as LinkCheckCandidate)),
    );
    evaluations.push(...batchEvaluations);
  }

  await sendScheduledBrokenLinkEmails(linksToCheck as LinkCheckCandidate[], evaluations);
  const results = evaluations.map((item) => item.result);

  return {
    batchSize: limit,
    checkedCount: results.length,
    brokenCount: results.filter((result) => result.isBroken).length,
    results,
  };
}
