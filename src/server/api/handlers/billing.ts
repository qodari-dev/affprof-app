import { db, subscriptions } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { eq } from 'drizzle-orm';
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  ensureStripeCustomer,
  hasActivePaidSubscription,
  listStripeBillingHistory,
} from '@/server/services/stripe-billing';
import { contract } from '../contracts';

// ============================================
// HANDLER
// ============================================

export const billing = tsr.router(contract.billing, {
  // ==========================================
  // GET - GET /billing
  // ==========================================
  get: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, auth.userId),
      });

      if (!subscription) {
        throwHttpError({
          status: 404,
          message: 'Subscription not found',
          code: 'NOT_FOUND',
        });
      }

      return {
        status: 200,
        body: subscription,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error fetching billing details',
      });
    }
  },

  // ==========================================
  // HISTORY - GET /billing/history
  // ==========================================
  history: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, auth.userId),
      });

      if (!subscription?.stripeCustomerId) {
        return {
          status: 200,
          body: [],
        };
      }

      return {
        status: 200,
        body: await listStripeBillingHistory(subscription.stripeCustomerId),
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error fetching billing history',
      });
    }
  },

  // ==========================================
  // CREATE CHECKOUT - POST /billing/create-checkout
  // For existing users upgrading from free to pro
  // ==========================================
  createCheckout: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const { plan } = body;

      // Get user's subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, auth.userId),
      });

      if (!subscription) {
        throwHttpError({
          status: 404,
          message: 'Subscription not found',
          code: 'NOT_FOUND',
        });
      }

      if (hasActivePaidSubscription(subscription)) {
        throwHttpError({
          status: 400,
          message: 'You already have an active subscription. Use the customer portal to manage it.',
          code: 'ALREADY_SUBSCRIBED',
        });
      }

      const customerId = await ensureStripeCustomer({
        subscription,
        userId: auth.userId,
        email: auth.user?.email,
      });

      const session = await createStripeCheckoutSession({
        customerId,
        userId: auth.userId,
        plan,
      });

      return {
        status: 200,
        body: { checkoutUrl: session.url! },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating checkout session',
      });
    }
  },

  // ==========================================
  // CREATE PORTAL - POST /billing/create-portal
  // For managing subscription (cancel, change plan, update payment)
  // ==========================================
  createPortal: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, auth.userId),
      });

      if (!subscription?.stripeCustomerId) {
        throwHttpError({
          status: 404,
          message: 'No billing account found. Subscribe to a plan first.',
          code: 'NO_CUSTOMER',
        });
      }

      const portalSession = await createStripeBillingPortalSession(subscription.stripeCustomerId);

      return {
        status: 200,
        body: { portalUrl: portalSession.url },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating customer portal session',
      });
    }
  },
});
