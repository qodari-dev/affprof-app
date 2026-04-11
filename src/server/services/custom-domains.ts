import { randomBytes } from 'crypto';
import { resolveCname, resolveTxt } from 'dns/promises';
import { and, asc, eq } from 'drizzle-orm';
import { parse as parseDomain } from 'tldts';

import { env } from '@/env';
import { db, customDomains, subscriptions, type CustomDomains } from '@/server/db';
import { throwHttpError } from '@/server/utils/generic-ts-rest-error';

const TXT_PREFIX = '_affprof';

function normalizeDnsValue(value: string) {
  return value.trim().toLowerCase().replace(/\.+$/, '');
}

function getDefaultCnameTarget() {
  const configured = env.CUSTOM_DOMAIN_CNAME_TARGET?.trim();
  if (configured) {
    return normalizeDnsValue(configured);
  }

  return normalizeDnsValue(getShortLinkDefaultHostname());
}

export function normalizeCustomHostname(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throwHttpError({
      status: 400,
      message: 'Enter a valid subdomain like go.yourbrand.com.',
      code: 'BAD_REQUEST',
    });
  }

  let hostname: string;

  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throwHttpError({
        status: 400,
        message: 'Only the hostname is allowed. Remove any path or query string.',
        code: 'BAD_REQUEST',
      });
    }
    hostname = normalizeDnsValue(parsed.hostname);
  } catch (error) {
    if (typeof error === 'object' && error && 'status' in error) {
      throw error;
    }

    throwHttpError({
      status: 400,
      message: 'Enter a valid subdomain like go.yourbrand.com.',
      code: 'BAD_REQUEST',
    });
  }

  const parsedDomain = parseDomain(hostname);
  if (!parsedDomain.isIcann || !parsedDomain.domain || !parsedDomain.subdomain) {
    throwHttpError({
      status: 400,
      message: 'Use a subdomain like go.yourbrand.com. Root domains are not supported yet.',
      code: 'BAD_REQUEST',
    });
  }

  if (hostname === normalizeDnsValue(new URL(env.NEXT_PUBLIC_APP_URL).hostname)) {
    throwHttpError({
      status: 400,
      message: 'This hostname is already used by AffProf.',
      code: 'BAD_REQUEST',
    });
  }

  if (hostname === normalizeDnsValue(getShortLinkDefaultHostname())) {
    throwHttpError({
      status: 400,
      message: 'This hostname is already used by AffProf short links.',
      code: 'BAD_REQUEST',
    });
  }

  return hostname;
}

export function buildCustomDomainSetup(hostname: string) {
  const verificationToken = randomBytes(16).toString('hex');

  return {
    verificationToken,
    verificationHost: `${TXT_PREFIX}.${hostname}`,
    verificationValue: `affprof-verify=${verificationToken}`,
    cnameTarget: getDefaultCnameTarget(),
  };
}

export function getShortLinkDefaultHostname() {
  const explicitBase = env.NEXT_PUBLIC_SHORTLINK_BASE_URL?.trim();
  if (explicitBase) {
    return new URL(explicitBase).hostname;
  }

  return new URL(env.NEXT_PUBLIC_APP_URL).hostname;
}

async function resolveTxtValues(hostname: string) {
  try {
    const records = await resolveTxt(hostname);
    return records.flat().map((value) => value.trim());
  } catch {
    return [];
  }
}

async function resolveCnameValues(hostname: string) {
  try {
    const records = await resolveCname(hostname);
    return records.map((value) => normalizeDnsValue(value));
  } catch {
    return [];
  }
}

export async function verifyCustomDomainRecord(domain: Pick<CustomDomains, 'hostname' | 'verificationHost' | 'verificationValue' | 'cnameTarget'>) {
  const [txtRecords, cnameRecords] = await Promise.all([
    resolveTxtValues(domain.verificationHost),
    resolveCnameValues(domain.hostname),
  ]);

  const hasVerificationTxt = txtRecords.includes(domain.verificationValue);
  const hasExpectedCname = cnameRecords.includes(normalizeDnsValue(domain.cnameTarget));

  return {
    isVerified: hasVerificationTxt && hasExpectedCname,
    hasVerificationTxt,
    hasExpectedCname,
  };
}

export async function getSubscriptionForDomainAccess(userId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    columns: {
      id: true,
      plan: true,
      status: true,
      currentPeriodEnd: true,
      cancelAt: true,
    },
  });

  if (!subscription || subscription.plan === 'free') {
    throwHttpError({
      status: 403,
      message: 'Custom domains are available on Pro plans.',
      code: 'FORBIDDEN',
    });
  }

  return subscription;
}

export async function enforceCustomDomainLimit(userId: string) {
  const existingDomains = await db.query.customDomains.findMany({
    where: eq(customDomains.userId, userId),
    columns: {
      id: true,
    },
    limit: 2,
  });

  if (existingDomains.length >= 1) {
    throwHttpError({
      status: 409,
      message: 'Your current plan supports one custom domain for now.',
      code: 'CONFLICT',
    });
  }
}

export async function listUserCustomDomains(userId: string) {
  return db.query.customDomains.findMany({
    where: eq(customDomains.userId, userId),
    orderBy: [asc(customDomains.createdAt)],
  });
}

export async function getCustomDomainByIdForUser(userId: string, id: string) {
  const domain = await db.query.customDomains.findFirst({
    where: and(eq(customDomains.userId, userId), eq(customDomains.id, id)),
  });

  if (!domain) {
    throwHttpError({
      status: 404,
      message: 'Custom domain not found.',
      code: 'NOT_FOUND',
    });
  }

  return domain;
}

export async function getPrimaryVerifiedCustomDomain(userId: string) {
  return db.query.customDomains.findFirst({
    where: and(
      eq(customDomains.userId, userId),
      eq(customDomains.isPrimary, true),
      eq(customDomains.status, 'verified'),
    ),
    columns: {
      id: true,
      hostname: true,
    },
  });
}

export async function findVerifiedCustomDomainByHostname(hostname: string) {
  return db.query.customDomains.findFirst({
    where: and(
      eq(customDomains.hostname, normalizeDnsValue(hostname)),
      eq(customDomains.status, 'verified'),
    ),
    columns: {
      id: true,
      userId: true,
      hostname: true,
    },
  });
}
