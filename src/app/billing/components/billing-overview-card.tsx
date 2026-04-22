'use client';

import * as React from 'react';
import { CalendarDays, CreditCard, ExternalLink, Loader2, ShieldCheck, Webhook } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { useBilling, useCreatePortal } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}

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

  // ---- Billing context for dynamic sidebar ----
  const isTrial =
    hasActivePaidPlan &&
    subscription.trialEndsAt !== null &&
    new Date(subscription.trialEndsAt) > new Date();
  const trialEndFormatted = subscription.trialEndsAt
    ? format(new Date(subscription.trialEndsAt), 'PP', { locale: dateFnsLocale })
    : '';

  type BillingCtx = 'free' | 'trialing' | 'active' | 'canceling' | 'past_due' | 'canceled';
  const billingCtx: BillingCtx = (() => {
    if (subscription.status === 'past_due') return 'past_due';
    if (subscription.status === 'canceled') return 'canceled';
    if (isScheduledToCancel) return 'canceling';
    if (isTrial) return 'trialing';
    if (hasActivePaidPlan) return 'active';
    return 'free';
  })();

  const ctxContent: Record<BillingCtx, { title: string; desc: string; bullets: string[] }> = {
    free: {
      title: t('ctxFreeTitle'),
      desc: t('ctxFreeDesc'),
      bullets: [t('ctxFreeBullet1'), t('ctxFreeBullet2'), t('ctxFreeBullet3')],
    },
    trialing: {
      title: t('ctxTrialTitle'),
      desc: t('ctxTrialDesc'),
      bullets: [
        t('ctxTrialBullet1', { date: trialEndFormatted }),
        t('ctxTrialBullet2'),
        t('ctxTrialBullet3'),
      ],
    },
    active: {
      title: t('ctxActiveTitle'),
      desc: t('ctxActiveDesc'),
      bullets: [
        t('ctxActiveBullet1', { date: periodValue }),
        t('ctxActiveBullet2'),
        t('ctxActiveBullet3'),
      ],
    },
    canceling: {
      title: t('ctxCancelingTitle'),
      desc: t('ctxCancelingDesc'),
      bullets: [
        t('ctxCancelingBullet1', { date: periodValue }),
        t('ctxCancelingBullet2'),
        t('ctxCancelingBullet3'),
      ],
    },
    past_due: {
      title: t('ctxPastDueTitle'),
      desc: t('ctxPastDueDesc'),
      bullets: [t('ctxPastDueBullet1'), t('ctxPastDueBullet2'), t('ctxPastDueBullet3')],
    },
    canceled: {
      title: t('ctxCanceledTitle'),
      desc: t('ctxCanceledDesc'),
      bullets: [t('ctxCanceledBullet1'), t('ctxCanceledBullet2'), t('ctxCanceledBullet3')],
    },
  };

  const ctx = ctxContent[billingCtx];

  // ---- Adaptive stat cards ----
  const planCard = (
    <StatCard key="plan" icon={CreditCard} label={t('plan')}>
      <div className="text-lg font-semibold">{formatPlan(subscription.plan)}</div>
    </StatCard>
  );

  const statCards = (() => {
    switch (billingCtx) {
      case 'free':
        return [planCard];

      case 'trialing':
        return [
          planCard,
          <StatCard key="trial" icon={CalendarDays} label={t('trialEnds')}>
            <div className="text-sm font-medium">{trialEndFormatted}</div>
          </StatCard>,
          <StatCard key="status" icon={ShieldCheck} label={t('status')}>
            <Badge variant="secondary">{tStatuses('trialing')}</Badge>
          </StatCard>,
        ];

      case 'active':
        return [
          planCard,
          <StatCard key="status" icon={ShieldCheck} label={t('status')}>
            <Badge variant="secondary">{tStatuses('active')}</Badge>
          </StatCard>,
          <StatCard key="renews" icon={Webhook} label={t('renews')}>
            <div className="text-sm font-medium">{periodValue}</div>
          </StatCard>,
        ];

      case 'canceling':
        return [
          planCard,
          <StatCard key="status" icon={ShieldCheck} label={t('status')}>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{tStatuses('active')}</Badge>
              <Badge variant="outline">{t('scheduledCancel')}</Badge>
            </div>
          </StatCard>,
          <StatCard key="ends" icon={Webhook} label={t('ends')}>
            <div className="text-sm font-medium">{periodValue}</div>
          </StatCard>,
        ];

      case 'past_due':
        return [
          planCard,
          <StatCard key="status" icon={ShieldCheck} label={t('status')}>
            <Badge variant="destructive">{tStatuses('past_due')}</Badge>
          </StatCard>,
          <StatCard key="renews" icon={Webhook} label={t('renews')}>
            <div className="text-sm font-medium">{periodValue}</div>
          </StatCard>,
        ];

      case 'canceled':
        return [
          planCard,
          <StatCard key="status" icon={ShieldCheck} label={t('status')}>
            <Badge variant="outline">{tStatuses('canceled')}</Badge>
          </StatCard>,
        ];
    }
  })();

  const gridCols =
    statCards.length === 1
      ? 'grid-cols-1'
      : statCards.length === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-3';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className={cn('grid gap-4', gridCols)}>
          {statCards}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">{ctx.title}</div>
            <p className="text-sm text-muted-foreground">{ctx.desc}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {ctx.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
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
