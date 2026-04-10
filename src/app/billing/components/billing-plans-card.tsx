'use client';

import * as React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useBilling, useCreateCheckout } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'pro' as const,
    name: 'Pro monthly',
    price: 'Monthly subscription',
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
    price: 'Annual subscription',
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

  const subscription = data?.status === 200 ? data.body : null;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade plans</CardTitle>
        <CardDescription>
          Keep pricing logic in Stripe and use webhooks to sync the final subscription state back into AffProf.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.id;
          const isFreeUser = subscription?.plan === 'free';

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
                disabled={isPending || isCurrentPlan || !isFreeUser}
                onClick={() => handleCheckout(plan.id)}
              >
                {isPending ? <Loader2 className="animate-spin" /> : null}
                {isCurrentPlan ? 'Current plan' : 'Start with Stripe Checkout'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
