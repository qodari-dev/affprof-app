'use client';

import { useTranslations } from 'next-intl';
import { PageContent, PageHeader } from '@/components/layout';
import { BillingHistoryCard } from './billing-history-card';
import { BillingOverviewCard } from './billing-overview-card';
import { BillingPlansCard } from './billing-plans-card';

export function BillingPage() {
  const t = useTranslations('billing');

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <PageContent>
        <BillingOverviewCard />
        <BillingPlansCard />
        <BillingHistoryCard />
      </PageContent>
    </>
  );
}
