import { db, subscriptions } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { stripe } from '@/server/utils/stripe';
import { env } from '@/env';
import { tsr } from '@ts-rest/serverless/next';
import { eq } from 'drizzle-orm';
import { contract } from '../contracts';

// ============================================
// HELPERS
// ============================================

function getPriceId(plan: 'pro' | 'pro_annual'): string {
  return plan === 'pro' ? env.STRIPE_PRO_MONTHLY_PRICE_ID : env.STRIPE_PRO_ANNUAL_PRICE_ID;
}

// ============================================
// HANDLER
// ============================================

export const billing = tsr.router(contract.billing, {
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

      // If already has active Stripe subscription, redirect to portal instead
      if (subscription.stripeSubscriptionId && subscription.status === 'active' && subscription.plan !== 'free') {
        throwHttpError({
          status: 400,
          message: 'You already have an active subscription. Use the customer portal to manage it.',
          code: 'ALREADY_SUBSCRIBED',
        });
      }

      // Create or reuse Stripe customer
      let customerId = subscription.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: auth.user?.email,
          metadata: { userId: auth.userId },
        });
        customerId = customer.id;

        await db
          .update(subscriptions)
          .set({ stripeCustomerId: customerId })
          .where(eq(subscriptions.userId, auth.userId));
      }

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: getPriceId(plan),
            quantity: 1,
          },
        ],
        metadata: { userId: auth.userId },
        success_url: `${env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing/canceled`,
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

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
      });

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
