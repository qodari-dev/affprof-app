'use client';

import * as React from 'react';
import { CreditCard, ExternalLink, Loader2, ShieldCheck, Webhook } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useBilling, useCreatePortal } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function formatPlan(plan: string) {
  if (plan === 'pro_annual') return 'Pro annual';
  if (plan === 'pro') return 'Pro monthly';
  return 'Free';
}

function formatStatus(plan: string, status: string) {
  if (plan === 'free') return 'Free plan';
  if (status === 'past_due') return 'Past due';
  if (status === 'canceled') return 'Canceled';
  if (status === 'paused') return 'Paused';
  return 'Active';
}

function getStatusVariant(plan: string, status: string): 'secondary' | 'outline' | 'destructive' {
  if (plan === 'free') return 'outline';
  if (status === 'active') return 'secondary';
  if (status === 'past_due') return 'destructive';
  return 'outline';
}

export function BillingOverviewCard() {
  const { data, isLoading } = useBilling();
  const { mutateAsync: openPortal, isPending: isOpeningPortal } = useCreatePortal();

  const subscription = data?.status === 200 ? data.body : null;

  const handleOpenPortal = React.useCallback(async () => {
    const result = await openPortal({});
    if (result.status === 200) {
      window.location.href = result.body.portalUrl;
      return;
    }

    toast.error('Could not open Stripe portal');
  }, [openPortal]);

  if (isLoading || !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription overview</CardTitle>
          <CardDescription>Your current plan, renewal timeline, and billing access.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasPortalAccess = Boolean(subscription.stripeCustomerId);
  const hasActivePaidPlan =
    subscription.status === 'active' &&
    subscription.plan !== 'free' &&
    Boolean(subscription.stripeSubscriptionId);
  const cancelAtDate = subscription.cancelAt ? new Date(subscription.cancelAt) : null;
  const isScheduledToCancel =
    subscription.status === 'active' &&
    (Boolean(subscription.cancelAtPeriodEnd) || cancelAtDate !== null);
  const periodLabel = isScheduledToCancel ? 'Ends' : 'Renews';
  const periodDate = isScheduledToCancel ? cancelAtDate : subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const periodValue = periodDate
    ? format(periodDate, 'MMM d, yyyy')
    : isScheduledToCancel
      ? 'Cancellation pending'
      : 'No renewal date';

  return (
      <Card>
      <CardHeader>
        <CardTitle>Subscription overview</CardTitle>
        <CardDescription>
          Review your current plan, renewal date, and billing access in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Plan</span>
            </div>
            <div className="text-lg font-semibold">{formatPlan(subscription.plan)}</div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Status</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(subscription.plan, subscription.status)}>
                {formatStatus(subscription.plan, subscription.status)}
              </Badge>
              {isScheduledToCancel ? <Badge variant="outline">Scheduled to cancel</Badge> : null}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Webhook className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{periodLabel}</span>
            </div>
            <div className="text-sm font-medium">{periodValue}</div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <ExternalLink className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Billing account</span>
            </div>
            <div className="text-sm font-medium">
              {hasPortalAccess ? 'Ready to manage' : 'Created after first payment'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">How billing works</div>
            <p className="text-sm text-muted-foreground">
              Manage your subscription directly from AffProf, with Stripe handling secure checkout and billing details behind the scenes.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Start a monthly or annual plan when you&apos;re ready to upgrade.</li>
              <li>Open billing to change payment method, switch cadence, or cancel later.</li>
              <li>Invoices and receipts stay available here after each successful payment.</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {isScheduledToCancel
            ? `Your plan is still active and will end on ${periodValue}. You can reopen billing anytime before then to keep it active.`
            : hasActivePaidPlan
              ? 'Need to change billing cycle, update your card, or cancel later? Open billing.'
              : 'You are currently on the free plan. Upgrade anytime when you need more capacity.'}
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg"
          disabled={!hasPortalAccess || isOpeningPortal}
          onClick={handleOpenPortal}
        >
          {isOpeningPortal ? <Loader2 className="animate-spin" /> : <ExternalLink />}
          Open billing
        </Button>
      </CardFooter>
    </Card>
  );
}
