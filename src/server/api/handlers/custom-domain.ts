import { and, eq } from 'drizzle-orm';
import { tsr } from '@ts-rest/serverless/next';

import { contract } from '../contracts';
import { getAuthContext } from '@/server/utils/auth-context';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { db, customDomains } from '@/server/db';
import {
  buildCustomDomainSetup,
  enforceCustomDomainLimit,
  getCustomDomainByIdForUser,
  getSubscriptionForDomainAccess,
  listUserCustomDomains,
  normalizeCustomHostname,
  verifyCustomDomainRecord,
} from '@/server/services/custom-domains';

function getVerificationErrorMessage(input: {
  hasVerificationTxt: boolean;
  hasExpectedCname: boolean;
}) {
  if (!input.hasVerificationTxt && !input.hasExpectedCname) {
    return 'AffProf could not find the TXT verification record or the required CNAME yet.';
  }

  if (!input.hasVerificationTxt) {
    return 'AffProf could not find the TXT verification record yet.';
  }

  return 'AffProf could not find the required CNAME yet.';
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
        throwHttpError({
          status: 400,
          message: getVerificationErrorMessage(result),
          code: 'BAD_REQUEST',
        });
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
});
