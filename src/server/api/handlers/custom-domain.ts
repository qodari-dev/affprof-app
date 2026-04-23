import { and, eq } from 'drizzle-orm';
import { tsr } from '@ts-rest/serverless/next';

import { contract } from '../contracts';
import { getAuthContext } from '@/server/utils/auth-context';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { db, customDomains } from '@/server/db';
import {
  buildCustomDomainSetup,
  enforceCustomDomainLimit,
  findVerifiedCustomDomainByHostname,
  getCustomDomainByIdForUser,
  getSubscriptionForDomainAccess,
  listUserCustomDomains,
  normalizeCustomHostname,
  verifyCustomDomainRecord,
} from '@/server/services/custom-domains';

function getVerificationError(input: {
  hasVerificationTxt: boolean;
  hasExpectedCname: boolean;
}): { message: string; code: string } {
  if (!input.hasVerificationTxt && !input.hasExpectedCname) {
    return {
      message: 'Neither the TXT verification record nor the CNAME record were found yet.',
      code: 'DOMAIN_RECORDS_NOT_FOUND',
    };
  }

  if (!input.hasVerificationTxt) {
    return {
      message: 'The TXT verification record was not found yet.',
      code: 'DOMAIN_TXT_NOT_FOUND',
    };
  }

  return {
    message: 'The CNAME record was not found yet.',
    code: 'DOMAIN_CNAME_NOT_FOUND',
  };
}

export const customDomainHandler = tsr.router(contract.customDomain, {
  list: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const domains = await listUserCustomDomains(auth.userId);

      return { status: 200, body: domains };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error fetching custom domains',
      });
    }
  },

  create: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      await getSubscriptionForDomainAccess(auth.userId);
      await enforceCustomDomainLimit(auth.userId);

      const hostname = normalizeCustomHostname(body.hostname);
      const setup = buildCustomDomainSetup(hostname);

      const [domain] = await db
        .insert(customDomains)
        .values({
          userId: auth.userId,
          hostname,
          isPrimary: true,
          ...setup,
        })
        .returning();

      return { status: 201, body: domain };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating custom domain',
      });
    }
  },

  verify: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const domain = await getCustomDomainByIdForUser(auth.userId, id);

      const result = await verifyCustomDomainRecord(domain);

      if (!result.isVerified) {
        const { message, code } = getVerificationError(result);
        throwHttpError({ status: 400, message, code });
      }

      const [verifiedDomain] = await db
        .update(customDomains)
        .set({
          status: 'verified',
          verifiedAt: new Date(),
        })
        .where(and(eq(customDomains.userId, auth.userId), eq(customDomains.id, id)))
        .returning();

      return { status: 200, body: verifiedDomain };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error verifying custom domain',
      });
    }
  },

  setPrimary: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const domain = await getCustomDomainByIdForUser(auth.userId, id);

      if (domain.status !== 'verified') {
        throwHttpError({
          status: 400,
          message: 'Verify the domain before making it the primary domain.',
          code: 'BAD_REQUEST',
        });
      }

      await db
        .update(customDomains)
        .set({ isPrimary: false })
        .where(eq(customDomains.userId, auth.userId));

      const [primaryDomain] = await db
        .update(customDomains)
        .set({ isPrimary: true })
        .where(and(eq(customDomains.userId, auth.userId), eq(customDomains.id, id)))
        .returning();

      return { status: 200, body: primaryDomain };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error updating custom domain',
      });
    }
  },

  delete: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const domain = await getCustomDomainByIdForUser(auth.userId, id);

      await db.delete(customDomains).where(and(eq(customDomains.userId, auth.userId), eq(customDomains.id, id)));

      return { status: 200, body: domain };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error deleting custom domain',
      });
    }
  },

  // Called by Caddy on-demand TLS before provisioning a certificate.
  // Returns 200 if the hostname is a verified custom domain, 404 otherwise.
  checkHostname: async ({ query: { domain } }) => {
    try {
      const hostname = domain.trim().toLowerCase().replace(/\.+$/, '');
      const found = await findVerifiedCustomDomainByHostname(hostname);

      if (!found) {
        return { status: 404, body: { message: 'Hostname not found', code: 'NOT_FOUND' } };
      }

      return { status: 200, body: { hostname: found.hostname } };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error checking hostname',
      });
    }
  },
});
