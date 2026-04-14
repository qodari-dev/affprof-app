'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { PageContent, PageHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardAnalytics } from '@/hooks/queries/use-analytics-queries';
import { useProducts } from '@/hooks/queries/use-product-queries';
import type { DashboardRange } from '@/schemas/analytics';

import { DashboardChart } from './dashboard-chart';
import { DashboardCountries } from './dashboard-countries';
import { DashboardHealthBanner } from './dashboard-health-banner';
import { DashboardKpisCards } from './dashboard-kpis';
import { DashboardSources } from './dashboard-sources';
import { DashboardToolbar } from './dashboard-toolbar';
import { DashboardTopLinks } from './dashboard-top-links';
import { DashboardTopProducts } from './dashboard-top-products';

export function Dashboard() {
  const t = useTranslations('dashboard');
  const [range, setRange] = React.useState<DashboardRange>('30d');
  const [productId, setProductId] = React.useState<string | undefined>(undefined);

  const { data: productsData } = useProducts({
    page: 1,
    limit: 100,
    sort: [{ field: 'name', order: 'asc' }],
  });

  const productOptions = React.useMemo(
    () =>
      (productsData?.body?.data ?? []).map((product) => ({
        label: product.name,
        value: product.id,
      })),
    [productsData?.body?.data],
  );

  const { data, isLoading, isFetching, refetch } = useDashboardAnalytics({
    range,
    productId,
  });

  const analytics = data?.body;

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <PageContent>
        <DashboardToolbar
          range={range}
          onRangeChange={setRange}
          productId={productId}
          productOptions={productOptions}
          onProductChange={setProductId}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        {isLoading || !analytics ? (
          <DashboardSkeleton />
        ) : (
          <>
            <DashboardHealthBanner brokenLinks={analytics.brokenLinks} />
            <DashboardKpisCards kpis={analytics.kpis} />
            <DashboardChart data={analytics.timeseries} peakDay={analytics.peakDay} />
            {productId ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DashboardTopLinks topLinks={analytics.topLinks} />
                <DashboardSources sources={analytics.trafficSources} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <DashboardTopProducts topProducts={analytics.topProducts} />
                  <DashboardTopLinks topLinks={analytics.topLinks} />
                </div>
                <DashboardSources sources={analytics.trafficSources} />
              </>
            )}
            <DashboardCountries countries={analytics.topCountries} />
          </>
        )}
      </PageContent>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px]" />
        ))}
      </div>
      <Skeleton className="h-[340px]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
      </div>
      <Skeleton className="h-[320px]" />
    </div>
  );
}
