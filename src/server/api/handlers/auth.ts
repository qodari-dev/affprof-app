import { db, users, subscriptions, userSettings } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { iamClient, IamClientError } from '@/iam/clients/iam-m2m-client';
import { stripe } from '@/server/utils/stripe';
import { env } from '@/env';
import { tsr } from '@ts-rest/serverless/next';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
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

function getPriceId(plan: 'pro' | 'pro_annual'): string {
  return plan === 'pro' ? env.STRIPE_PRO_MONTHLY_PRICE_ID : env.STRIPE_PRO_ANNUAL_PRICE_ID;
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

      // 4) If paid plan, create Stripe customer + Checkout Session
      let checkoutUrl: string | null = null;

      if (plan !== 'free') {
        const customer = await stripe.customers.create({
          email: email.toLowerCase(),
          name: `${firstName} ${lastName}`,
          metadata: { userId: iamUser.id },
        });

        // Update subscription with Stripe customer ID
        await db
          .update(subscriptions)
          .set({ stripeCustomerId: customer.id })
          .where(eq(subscriptions.userId, iamUser.id));

        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: 'subscription',
          line_items: [
            {
              price: getPriceId(plan),
              quantity: 1,
            },
          ],
          metadata: { userId: iamUser.id },
          success_url: `${env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing/canceled`,
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
  // LOGOUT - POST /auth/logout
  // ==========================================
  logout: async () => {
    try {
      const secure = env.NODE_ENV === 'production';
      const cookieStore = await cookies();

      // Clear access token
      cookieStore.set(env.ACCESS_TOKEN_NAME, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      // Clear refresh token
      cookieStore.set(env.REFRESH_TOKEN_NAME, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      // Build IAM logout URL
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
