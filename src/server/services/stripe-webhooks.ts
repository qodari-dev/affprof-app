import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';

import { env } from '@/env';
import { db, subscriptions } from '@/server/db';
import { stripe } from '@/server/utils/stripe';

type InternalPlan = 'free' | 'pro' | 'pro_annual';
type InternalStatus = 'active' | 'past_due' | 'canceled' | 'paused';

type RawSubscription = Stripe.Subscription & {
  current_period_end?: number;
};

type RawInvoice = Stripe.Invoice & {
  subscription?: string | { id: string } | null;
};

function mapStripePlan(priceId: string): InternalPlan {
  if (priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID) return 'pro';
  if (priceId === env.STRIPE_PRO_ANNUAL_PRICE_ID) return 'pro_annual';
  return 'free';
}

function mapStripeStatus(status: Stripe.Subscription.Status): InternalStatus {
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

function getSubscriptionId(ref: string | { id: string } | null | undefined) {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  return ref.id;
}

function getPeriodEnd(subscription: RawSubscription) {
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000);
  }

  const item = subscription.items?.data?.[0];
  if (item && 'current_period_end' in item) {
    return new Date((item as { current_period_end: number }).current_period_end * 1000);
  }

  return null;
}

function buildSubscriptionPatch(subscription: RawSubscription) {
  const priceId = subscription.items.data[0]?.price.id ?? '';
  const periodEnd = getPeriodEnd(subscription);

  return {
    stripePriceId: priceId,
    status: mapStripeStatus(subscription.status),
    plan: mapStripePlan(priceId),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
  };
}

async function syncCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('[stripe-webhook] checkout.session.completed: missing userId in metadata');
    return;
  }

  const stripeSubscriptionId = getSubscriptionId(
    session.subscription as string | { id: string } | null,
  );

  if (!stripeSubscriptionId) {
    console.error('[stripe-webhook] checkout.session.completed: missing subscription');
    return;
  }

  const stripeSubscription = (await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
  )) as unknown as RawSubscription;

  await db
    .update(subscriptions)
    .set({
      stripeSubscriptionId,
      stripeCustomerId:
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id,
      ...buildSubscriptionPatch(stripeSubscription),
    })
    .where(eq(subscriptions.userId, userId));
}

async function syncInvoicePaid(invoice: RawInvoice) {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);
  if (!stripeSubscriptionId) return;

  const stripeSubscription = (await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
  )) as unknown as RawSubscription;

  await db
    .update(subscriptions)
    .set({
      ...buildSubscriptionPatch(stripeSubscription),
      status: 'active',
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

async function syncInvoiceFailed(invoice: RawInvoice) {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);
  if (!stripeSubscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'past_due' })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

async function syncSubscriptionUpdated(subscription: RawSubscription) {
  await db
    .update(subscriptions)
    .set(buildSubscriptionPatch(subscription))
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function syncSubscriptionDeleted(subscription: RawSubscription) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      plan: 'free',
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

export function constructStripeWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await syncCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      await syncInvoicePaid(event.data.object as RawInvoice);
      break;

    case 'invoice.payment_failed':
      await syncInvoiceFailed(event.data.object as RawInvoice);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await syncSubscriptionUpdated(event.data.object as RawSubscription);
      break;

    case 'customer.subscription.deleted':
      await syncSubscriptionDeleted(event.data.object as RawSubscription);
      break;

    default:
      break;
  }
}
