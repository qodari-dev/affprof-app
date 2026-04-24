'use client';

import { AlertTriangle, BarChart2, Link2, Plus, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <div className="flex flex-col gap-6">
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
              <Link href="/links?status=broken" className="text-xs font-medium text-destructive underline underline-offset-2">
                {t('reviewBroken')}
              </Link>
            ) : undefined
          }
        />
        <StatCard
          icon={<BarChart2 className="size-5 text-muted-foreground" />}
          label={t('clicksLast30d')}
          value={clicks.toLocaleString()}
          sub={t('viewAnalytics')}
          action={
            <Link href="/dashboard" className="text-xs font-medium text-primary underline underline-offset-2">
              {t('openDashboard')}
            </Link>
          }
        />
      </div>

      <QuickActions />
    </div>
  );
}

function QuickActions() {
  const t = useTranslations('home.actions');

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/links">
          <Plus className="mr-1.5 size-3.5" />
          {t('addLink')}
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <BarChart2 className="mr-1.5 size-3.5" />
          {t('viewDashboard')}
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/links">
          <Link2 className="mr-1.5 size-3.5" />
          {t('viewLinks')}
        </Link>
      </Button>
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
  const router = useRouter();

  const features = [
    { icon: Link2, label: t('feat1') },
    { icon: BarChart2, label: t('feat2') },
    { icon: ShieldCheck, label: t('feat3') },
    { icon: Zap, label: t('feat4') },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Link2 className="size-8 text-primary" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">{t('title')}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Icon className="size-3.5" />
            {label}
          </div>
        ))}
      </div>

      <Button onClick={() => router.push('/links')}>
        <Plus className="mr-1.5 size-4" />
        {t('cta')}
      </Button>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[140px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
