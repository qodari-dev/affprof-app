'use client';

import * as React from 'react';
import { CreditCard, ExternalLink, Loader2, ShieldCheck, Webhook } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { useBilling, useCreatePortal } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusVariant(plan: string, status: string): 'secondary' | 'outline' | 'destructive' {
  if (plan === 'free') return 'outline';
  if (status === 'active') return 'secondary';
  if (status === 'past_due') return 'destructive';
  return 'outline';
}

export function BillingOverviewCard() {
  const t = useTranslations('billing.overview');
  const tPlans = useTranslations('billing.planNames');
  const tStatuses = useTranslations('billing.statuses');
  const locale = useLocale();
  const dateFnsLocale = locale === 'es' ? esLocale : enUS;

  const { data, isLoading } = useBilling();
  const { mutateAsync: openPortal, isPending: isOpeningPortal } = useCreatePortal();

  const subscription = data?.status === 200 ? data.body : null;

  const formatPlan = React.useCallback(
    (plan: string) => {
      if (plan === 'pro_annual') return tPlans('pro_annual');
      if (plan === 'pro') return tPlans('pro');
      return tPlans('free');
    },
    [tPlans],
  );

  const formatStatus = React.useCallback(
    (plan: string, status: string) => {
      if (plan === 'free') return tStatuses('freePlan');
      if (status === 'past_due') return tStatuses('past_due');
      if (status === 'canceled') return tStatuses('canceled');
      if (status === 'paused') return tStatuses('paused');
      return tStatuses('active');
    },
    [tStatuses],
  );

  const handleOpenPortal = React.useCallback(async () => {
    const result = await openPortal({});
    if (result.status === 200) {
      window.location.href = result.body.portalUrl;
      return;
    }

    toast.error(t('toastPortalError'));
  }, [openPortal, t]);

  if (isLoading || !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('loadingDescription')}</CardDescription>
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
  const periodLabel = isScheduledToCancel ? t('ends') : t('renews');
  const periodDate = isScheduledToCancel ? cancelAtDate : subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const periodValue = periodDate
    ? format(periodDate, 'PP', { locale: dateFnsLocale })
    : isScheduledToCancel
      ? t('cancellationPending')
      : t('noRenewalDate');

  return (
      <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{t('plan')}</span>
            </div>
            <div className="text-lg font-semibold">{formatPlan(subscription.plan)}</div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{t('status')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(subscription.plan, subscription.status)}>
                {formatStatus(subscription.plan, subscription.status)}
              </Badge>
              {isScheduledToCancel ? <Badge variant="outline">{t('scheduledCancel')}</Badge> : null}
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
              <span className="text-xs font-medium uppercase tracking-wide">{t('billingAccount')}</span>
            </div>
            <div className="text-sm font-medium">
              {hasPortalAccess ? t('readyToManage') : t('createdAfterPayment')}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">{t('howBillingWorks')}</div>
            <p className="text-sm text-muted-foreground">
              {t('billingExplanation')}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('bulletStartPlan')}</li>
              <li>{t('bulletOpenBilling')}</li>
              <li>{t('bulletInvoices')}</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {isScheduledToCancel
            ? t('footerScheduledCancel', { date: periodValue })
            : hasActivePaidPlan
              ? t('footerActivePaid')
              : t('footerFree')}
        </p>
        <Button
          type="button"
          className="h-10 rounded-lg"
          disabled={!hasPortalAccess || isOpeningPortal}
          onClick={handleOpenPortal}
        >
          {isOpeningPortal ? <Loader2 className="animate-spin" /> : <ExternalLink />}
          {t('openBilling')}
        </Button>
      </CardFooter>
    </Card>
  );
}
