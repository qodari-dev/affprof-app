'use client';

import * as React from 'react';
import { Check, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useBilling, useCreateCheckout, useCreatePortal } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'pro' as const,
    name: 'Pro monthly',
    price: '$12/month',
    description: 'Best if you want flexibility while validating your creator workflow.',
    highlight: false,
    features: [
      'Manage products, links, QR codes, and tags',
      'Track link performance and broken link alerts',
      'Stripe-hosted checkout and customer portal',
    ],
  },
  {
    id: 'pro_annual' as const,
    name: 'Pro annual',
    price: '$120/year',
    description: 'Best if AffProf is already part of your operating stack.',
    highlight: true,
    features: [
      'Everything in Pro monthly',
      'Longer commitment for serious creator businesses',
      'Cleaner yearly billing with the same webhook flow',
    ],
  },
] as const;

export function BillingPlansCard() {
  const { data } = useBilling();
  const { mutateAsync: createCheckout, isPending } = useCreateCheckout();
  const { mutateAsync: createPortal, isPending: isOpeningPortal } = useCreatePortal();

  const subscription = data?.status === 200 ? data.body : null;
  const hasActivePaidPlan =
    subscription?.status === 'active' &&
    subscription.plan !== 'free' &&
    Boolean(subscription.stripeSubscriptionId);
  const currentPlan = subscription?.plan ?? 'free';

  const handleCheckout = React.useCallback(
    async (plan: 'pro' | 'pro_annual') => {
      const result = await createCheckout({
        body: { plan },
      });

      if (result.status === 200) {
        window.location.href = result.body.checkoutUrl;
        return;
      }

      toast.error('Could not create Stripe checkout');
    },
    [createCheckout],
  );

  const handleOpenPortal = React.useCallback(async () => {
    const result = await createPortal({});

    if (result.status === 200) {
      window.location.href = result.body.portalUrl;
      return;
    }

    toast.error('Could not open Stripe portal');
  }, [createPortal]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans</CardTitle>
        <CardDescription>
          Choose monthly or annual billing. If you already have a paid plan, use billing to switch cadence or manage cancellation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.id;
          const canStartCheckout = currentPlan === 'free';
          const shouldRouteToPortal = hasActivePaidPlan && !isCurrentPlan;
          const isBusy = isPending || isOpeningPortal;

          return (
            <div
              key={plan.id}
              className={cn(
                'rounded-2xl border p-5',
                plan.highlight ? 'border-emerald-300 bg-emerald-50/50' : 'bg-card',
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.highlight ? (
                      <Badge variant="secondary">
                        <Sparkles className="size-3" />
                        Recommended
                      </Badge>
                    ) : null}
                    {isCurrentPlan ? <Badge variant="outline">Current</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-4 text-sm font-medium text-foreground">{plan.price}</div>

              <ul className="mb-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                className="h-11 w-full rounded-lg"
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={isBusy || isCurrentPlan}
                onClick={() => {
                  if (shouldRouteToPortal) {
                    void handleOpenPortal();
                    return;
                  }

                  void handleCheckout(plan.id);
                }}
              >
                {isBusy ? <Loader2 className="animate-spin" /> : shouldRouteToPortal ? <ExternalLink /> : null}
                {isCurrentPlan
                  ? 'Current plan'
                  : canStartCheckout
                    ? 'Choose plan'
                    : 'Switch in billing'}
              </Button>
              {!isCurrentPlan && shouldRouteToPortal ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  You already have an active paid plan. Open billing to switch between monthly and annual or manage cancellation.
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
