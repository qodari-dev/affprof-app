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

function formatStatus(status: string) {
  if (status === 'past_due') return 'Past due';
  if (status === 'canceled') return 'Canceled';
  if (status === 'paused') return 'Paused';
  return 'Active';
}

function getStatusVariant(status: string): 'secondary' | 'outline' | 'destructive' {
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
          <CardDescription>Stripe is the billing source of truth for your SaaS account.</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription overview</CardTitle>
        <CardDescription>
          Stripe handles checkout, recurring billing, customer portal, and webhook-driven subscription updates.
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
            <Badge variant={getStatusVariant(subscription.status)}>{formatStatus(subscription.status)}</Badge>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Webhook className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Renews</span>
            </div>
            <div className="text-sm font-medium">
              {subscription.currentPeriodEnd
                ? format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')
                : 'No renewal date'}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <ExternalLink className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Portal</span>
            </div>
            <div className="text-sm font-medium">{hasPortalAccess ? 'Available' : 'Unlock after first checkout'}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Recommended billing model</div>
            <p className="text-sm text-muted-foreground">
              For AffProf as a SaaS, Stripe is the right setup: Checkout for purchases, Customer Portal for self-service changes, and webhooks as the backend truth.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Checkout creates or upgrades paid subscriptions.</li>
              <li>Customer Portal lets users update payment method, cancel, or switch plan.</li>
              <li>Webhooks update local subscription state after Stripe confirms the event.</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Your app should trust Stripe events, not only frontend redirects.
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg"
          disabled={!hasPortalAccess || isOpeningPortal}
          onClick={handleOpenPortal}
        >
          {isOpeningPortal ? <Loader2 className="animate-spin" /> : <ExternalLink />}
          Manage in Stripe
        </Button>
      </CardFooter>
    </Card>
  );
}
