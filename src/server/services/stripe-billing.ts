import { eq } from 'drizzle-orm';

import { env } from '@/env';
import { db, subscriptions, type Subscriptions } from '@/server/db';
import { stripe } from '@/server/utils/stripe';

export type PaidPlan = 'pro' | 'pro_annual';

export function getStripePriceId(plan: PaidPlan) {
  return plan === 'pro' ? env.STRIPE_PRO_MONTHLY_PRICE_ID : env.STRIPE_PRO_ANNUAL_PRICE_ID;
}

export function hasActivePaidSubscription(
  subscription: Pick<Subscriptions, 'stripeSubscriptionId' | 'status' | 'plan'>,
) {
  return (
    Boolean(subscription.stripeSubscriptionId) &&
    subscription.status === 'active' &&
    subscription.plan !== 'free'
  );
}

export async function ensureStripeCustomer(input: {
  subscription: Pick<Subscriptions, 'userId' | 'stripeCustomerId'>;
  userId: string;
  email?: string | null;
}) {
  if (input.subscription.stripeCustomerId) {
    return input.subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    metadata: { userId: input.userId },
  });

  await db
    .update(subscriptions)
    .set({ stripeCustomerId: customer.id })
    .where(eq(subscriptions.userId, input.subscription.userId));

  return customer.id;
}

export async function createStripeCheckoutSession(input: {
  customerId: string;
  userId: string;
  plan: PaidPlan;
}) {
  return stripe.checkout.sessions.create({
    customer: input.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: getStripePriceId(input.plan),
        quantity: 1,
      },
    ],
    metadata: { userId: input.userId },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing/canceled`,
  });
}

export async function createStripeBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
  });
}

export async function listStripeBillingHistory(customerId: string) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 12,
  });

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.number,
    status: invoice.status ?? null,
    currency: invoice.currency,
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
    createdAt: new Date(invoice.created * 1000).toISOString(),
    periodStart: invoice.period_start
      ? new Date(invoice.period_start * 1000).toISOString()
      : null,
    periodEnd: invoice.period_end
      ? new Date(invoice.period_end * 1000).toISOString()
      : null,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  }));
}
