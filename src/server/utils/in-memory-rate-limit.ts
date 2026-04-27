type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const MAX_BUCKETS = 50_000;

declare global {
  var __affprofRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__affprofRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__affprofRateLimitBuckets = buckets;

let lastCleanupAt = 0;

function cleanupExpiredBuckets(now: number, force = false) {
  if (!force && now - lastCleanupAt < 60_000) return;
  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    if (!existing && buckets.size >= MAX_BUCKETS) {
      cleanupExpiredBuckets(now, true);

      if (buckets.size >= MAX_BUCKETS) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        };
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
