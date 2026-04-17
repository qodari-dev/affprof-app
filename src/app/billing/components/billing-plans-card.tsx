'use client';

import * as React from 'react';
import { Check, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useBilling, useCreateCheckout, useCreatePortal } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PRICING } from '@/config/pricing';

const PLAN_IDS = ['pro', 'pro_annual'] as const;
type PlanId = (typeof PLAN_IDS)[number];

export function BillingPlansCard() {
  const t = useTranslations('billing.plans');
  const tPro = useTranslations('billing.plans.pro');
  const tProAnnual = useTranslations('billing.plans.pro_annual');

  const { data } = useBilling();
  const { mutateAsync: createCheckout, isPending } = useCreateCheckout();
  const { mutateAsync: createPortal, isPending: isOpeningPortal } = useCreatePortal();

  const subscription = data?.status === 200 ? data.body : null;
  const hasActivePaidPlan =
    subscription?.status === 'active' &&
    subscription.plan !== 'free' &&
    Boolean(subscription.stripeSubscriptionId);
  const currentPlan = subscription?.plan ?? 'free';

  const plans = React.useMemo(
    () => [
      {
        id: 'pro' as PlanId,
        name: tPro('name'),
        price: PRICING.pro.label,
        description: tPro('description'),
        highlight: false,
        features: [tPro('feature1'), tPro('feature2'), tPro('feature3')],
      },
      {
        id: 'pro_annual' as PlanId,
        name: tProAnnual('name'),
        price: PRICING.proAnnual.label,
        subPrice: PRICING.proAnnual.subLabel,
        description: tProAnnual('description'),
        highlight: true,
        features: [tProAnnual('feature1'), tProAnnual('feature2'), tProAnnual('feature3')],
      },
    ],
    [tPro, tProAnnual],
  );

  const handleCheckout = React.useCallback(
    async (plan: PlanId) => {
      const result = await createCheckout({
        body: { plan },
      });

      if (result.status === 200) {
        window.location.href = result.body.checkoutUrl;
        return;
      }

      toast.error(t('toastCheckoutError'));
    },
    [createCheckout, t],
  );

  const handleOpenPortal = React.useCallback(async () => {
    const result = await createPortal({});

    if (result.status === 200) {
      window.location.href = result.body.portalUrl;
      return;
    }

    toast.error(t('toastCheckoutError'));
  }, [createPortal, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.id;
          const canStartCheckout = currentPlan === 'free';
          const shouldRouteToPortal = hasActivePaidPlan && !isCurrentPlan;
          const isBusy = isPending || isOpeningPortal;

          return (
            <div
              key={plan.id}
              className={cn(
                'rounded-2xl border p-5',
                plan.highlight ? 'border-emerald-300 dark:bg-emerald-900/50 bg-emerald-50/50' : 'bg-card',
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.highlight ? (
                      <Badge variant="secondary">
                        <Sparkles className="size-3" />
                        {t('recommended')}
                      </Badge>
                    ) : null}
                    {isCurrentPlan ? <Badge variant="outline">{t('current')}</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-4 flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-foreground">{plan.price}</span>
                {'subPrice' in plan && (
                  <span className="text-xs text-muted-foreground">{plan.subPrice}</span>
                )}
              </div>

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
                  ? t('currentPlan')
                  : canStartCheckout
                    ? t('choosePlan')
                    : t('switchInBilling')}
              </Button>
              {!isCurrentPlan && shouldRouteToPortal ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('switchNote')}
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
