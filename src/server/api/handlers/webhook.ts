import { stripe } from '@/server/utils/stripe';
import { env } from '@/env';
import { db, subscriptions } from '@/server/db';
import { eq } from 'drizzle-orm';
import { tsr } from '@ts-rest/serverless/next';
import { contract } from '../contracts';
import type Stripe from 'stripe';

// ============================================
// TYPES — Stripe v22 removed some fields from
// the typed interfaces. We use a raw type for
// webhook event data which still has them.
// ============================================

type RawSubscription = Stripe.Subscription & {
  current_period_end?: number;
};

type RawInvoice = Stripe.Invoice & {
  subscription?: string | { id: string } | null;
};

// ============================================
// HELPERS
// ============================================

function mapStripePlan(priceId: string): 'free' | 'pro' | 'pro_annual' {
  if (priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID) return 'pro';
  if (priceId === env.STRIPE_PRO_ANNUAL_PRICE_ID) return 'pro_annual';
  return 'free';
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'past_due' | 'canceled' | 'paused' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}

function getSubscriptionId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  return ref.id;
}

function getPeriodEnd(subscription: RawSubscription): Date | null {
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000);
  }
  const item = subscription.items?.data?.[0];
  if (item && 'current_period_end' in item) {
    return new Date((item as { current_period_end: number }).current_period_end * 1000);
  }
  return null;
}

// ============================================
// EVENT HANDLERS
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('[stripe-webhook] checkout.session.completed: missing userId in metadata');
    return;
  }

  const stripeSubscriptionId = getSubscriptionId(
    session.subscription as string | { id: string } | null
  );

  if (!stripeSubscriptionId) {
    console.error('[stripe-webhook] checkout.session.completed: missing subscription');
    return;
  }

  const stripeSubscription = (await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  )) as unknown as RawSubscription;

  const priceId = stripeSubscription.items.data[0]?.price.id ?? '';
  const plan = mapStripePlan(priceId);
  const periodEnd = getPeriodEnd(stripeSubscription);

  await db
    .update(subscriptions)
    .set({
      stripeSubscriptionId,
      stripeCustomerId:
        typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripePriceId: priceId,
      status: 'active',
      plan,
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
    })
    .where(eq(subscriptions.userId, userId));
}

async function handleInvoicePaymentSucceeded(invoice: RawInvoice) {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);
  if (!stripeSubscriptionId) return;

  const stripeSubscription = (await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  )) as unknown as RawSubscription;

  const periodEnd = getPeriodEnd(stripeSubscription);

  await db
    .update(subscriptions)
    .set({
      status: 'active',
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

async function handleInvoicePaymentFailed(invoice: RawInvoice) {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);
  if (!stripeSubscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'past_due' })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

async function handleSubscriptionUpdated(subscription: RawSubscription) {
  const priceId = subscription.items.data[0]?.price.id ?? '';
  const plan = mapStripePlan(priceId);
  const status = mapStripeStatus(subscription.status);
  const periodEnd = getPeriodEnd(subscription);

  await db
    .update(subscriptions)
    .set({
      stripePriceId: priceId,
      status,
      plan,
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: RawSubscription) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      plan: 'free',
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

// ============================================
// HANDLER
// ============================================

export const webhook = tsr.router(contract.webhook, {
  stripe: async ({ body }, { request }) => {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return {
        status: 400 as const,
        body: { message: 'Missing stripe-signature header' },
      };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[stripe-webhook] signature verification failed:', message);
      return {
        status: 400 as const,
        body: { message: 'Invalid signature' },
      };
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as RawInvoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as RawInvoice);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as RawSubscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as RawSubscription);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(`[stripe-webhook] Error handling ${event.type}:`, err);
      return {
        status: 500 as const,
        body: { message: 'Webhook handler failed' },
      };
    }

    return {
      status: 200 as const,
      body: { received: true as const },
    };
  },
});
