'use client';

import { PageContent, PageHeader } from '@/components/layout';
import { BillingHistoryCard } from './billing-history-card';
import { BillingOverviewCard } from './billing-overview-card';
import { BillingPlansCard } from './billing-plans-card';

export function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your subscription, payment flow, and customer portal access."
      />
      <PageContent>
        <BillingOverviewCard />
        <BillingPlansCard />
        <BillingHistoryCard />
      </PageContent>
    </>
  );
}
