import { db, users, subscriptions, userSettings } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { clearAuthCookies } from '@/server/utils/clear-auth-cookies';
import { deleteSpacesUserFiles } from '@/server/utils/storage/spaces-presign';
import { iamClient, IamClientError } from '@/iam/clients/iam-m2m-client';
import { sendWelcomeEmail } from '@/server/services/transactional-emails';
import { createStripeCheckoutSession, ensureStripeCustomer } from '@/server/services/stripe-billing';
import { stripe } from '@/server/utils/stripe';
import { env } from '@/env';
import { tsr } from '@ts-rest/serverless/next';
import { eq } from 'drizzle-orm';
import { contract } from '../contracts';

// ============================================
// HELPERS
// ============================================

function generateSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Add random suffix to avoid collisions
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

// ============================================
// HANDLER
// ============================================

export const auth = tsr.router(contract.auth, {
  // ==========================================
  // REGISTER - POST /auth/register
  // ==========================================
  register: async ({ body }) => {
    try {
      const { email, firstName, lastName, password, plan } = body;

      // 1) Check if user already exists locally
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (existingUser) {
        throwHttpError({
          status: 409,
          message: 'An account with this email already exists',
          code: 'EMAIL_EXISTS',
        });
      }

      // 2) Create user in IAM via M2M
      let iamUser;
      try {
        iamUser = await iamClient.createUser({
          email: email.toLowerCase(),
          firstName,
          lastName,
          password,
          isAdmin: false,
          isEmployee: false,
          status: 'active',
        });
      } catch (e) {
        if (e instanceof IamClientError && e.code === 'EMAIL_EXISTS') {
          throwHttpError({
            status: 409,
            message: 'An account with this email already exists',
            code: 'EMAIL_EXISTS',
          });
        }
        throw e;
      }

      // 3) Create local user, subscription, and settings in a transaction
      const slug = generateSlug(firstName, lastName);

      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: iamUser.id,
          email: email.toLowerCase(),
          name: `${firstName} ${lastName}`,
          slug,
        });

        await tx.insert(subscriptions).values({
          userId: iamUser.id,
          status: 'active',
          plan: 'free',
        });

        await tx.insert(userSettings).values({
          userId: iamUser.id,
        });
      });

      // 4) Send welcome email (fire and forget — don't block registration)
      void sendWelcomeEmail({
        userEmail: email.toLowerCase(),
        userName: `${firstName} ${lastName}`,
        locale: 'en',
      });

      // 5) If paid plan, create Stripe customer + Checkout Session
      let checkoutUrl: string | null = null;

      if (plan !== 'free') {
        const customerId = await ensureStripeCustomer({
          subscription: { userId: iamUser.id, stripeCustomerId: null },
          userId: iamUser.id,
          email: email.toLowerCase(),
        });

        const session = await createStripeCheckoutSession({
          customerId,
          userId: iamUser.id,
          plan,
        });

        checkoutUrl = session.url;
      }

      return {
        status: 201,
        body: {
          userId: iamUser.id,
          plan,
          checkoutUrl,
        },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating account',
      });
    }
  },

  // ==========================================
  // DELETE ACCOUNT - DELETE /auth/account
  // ==========================================
  deleteAccount: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      // 1) Get subscription to check for Stripe customer
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, auth.userId),
        columns: { stripeSubscriptionId: true, stripeCustomerId: true },
      });

      // 2) Cancel Stripe subscription if active
      if (subscription?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } catch (err) {
          // Log but don't block deletion if Stripe fails
          console.error('[deleteAccount] Stripe cancel failed:', err);
        }
      }

      // 3) Delete all files from Spaces (fire and forget — non-blocking)
      void deleteSpacesUserFiles(auth.userId);

      // 4) Delete user from IAM (M2M)
      await iamClient.deleteUser(auth.userId);

      // 5) Delete local user — cascade handles all child tables
      await db.delete(users).where(eq(users.id, auth.userId));

      // 5) Clear auth cookies
      await clearAuthCookies();

      const logoutUrl = new URL('/oauth/logout', env.IAM_BASE_URL);
      logoutUrl.searchParams.set('client_id', env.IAM_CLIENT_ID);

      return {
        status: 200,
        body: { logoutUrl: logoutUrl.toString() },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error deleting account',
      });
    }
  },

  // ==========================================
  // LOGOUT - POST /auth/logout
  // ==========================================
  logout: async () => {
    try {
      await clearAuthCookies();

      const logoutUrl = new URL('/oauth/logout', env.IAM_BASE_URL);
      logoutUrl.searchParams.set('client_id', env.IAM_CLIENT_ID);

      return {
        status: 200,
        body: { logoutUrl: logoutUrl.toString() },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error during logout',
      });
    }
  },
});
