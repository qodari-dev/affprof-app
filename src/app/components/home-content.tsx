'use client';

import { AlertTriangle, BarChart2, Link2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageContent, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardAnalytics } from '@/hooks/queries/use-analytics-queries';
import { useProfile } from '@/hooks/queries/use-profile-queries';

export function HomeContent() {
  const t = useTranslations('home');
  const { data: profileData } = useProfile();
  const { data, isLoading } = useDashboardAnalytics({ range: '30d' });

  const userName = profileData?.status === 200 ? profileData.body.name : '';
  const analytics = data?.body;

  const title = userName ? t('greeting', { name: userName }) : t('title');

  return (
    <>
      <PageHeader title={title} description={t('description')} />
      <PageContent>
        {isLoading || !analytics ? (
          <HomeSkeleton />
        ) : analytics.kpis.links.total === 0 ? (
          <HomeEmpty />
        ) : (
          <HomeStats analytics={analytics} />
        )}
      </PageContent>
    </>
  );
}

function HomeStats({ analytics }: { analytics: NonNullable<ReturnType<typeof useDashboardAnalytics>['data']>['body'] }) {
  const t = useTranslations('home.stats');
  const { total, active, broken } = analytics.kpis.links;
  const clicks = analytics.kpis.clicks.value;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={<Link2 className="size-5 text-muted-foreground" />}
        label={t('totalLinks')}
        value={total}
        sub={t('activeLinks', { count: active })}
      />
      <StatCard
        icon={
          broken > 0 ? (
            <AlertTriangle className="size-5 text-destructive" />
          ) : (
            <AlertTriangle className="size-5 text-muted-foreground" />
          )
        }
        label={t('brokenLinks')}
        value={broken}
        valueClassName={broken > 0 ? 'text-destructive' : undefined}
        sub={broken > 0 ? t('needsAttention') : t('allHealthy')}
        action={
          broken > 0 ? (
            <a href="/links?status=broken" className="text-xs font-medium text-destructive underline underline-offset-2">
              {t('reviewBroken')}
            </a>
          ) : undefined
        }
      />
      <StatCard
        icon={<BarChart2 className="size-5 text-muted-foreground" />}
        label={t('clicksLast30d')}
        value={clicks.toLocaleString()}
        sub={t('viewAnalytics')}
        action={
          <a href="/dashboard" className="text-xs font-medium text-primary underline underline-offset-2">
            {t('openDashboard')}
          </a>
        }
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  action,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  action?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-3xl font-bold tabular-nums ${valueClassName ?? ''}`}>{value}</span>
      <div className="flex items-center justify-between gap-2">
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        {action}
      </div>
    </div>
  );
}

function HomeEmpty() {
  const t = useTranslations('home.empty');

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Link2 className="size-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold">{t('title')}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <Button asChild>
        <a href="/links">
          <Plus className="mr-1.5 size-4" />
          {t('cta')}
        </a>
      </Button>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
    </div>
  );
}
