'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { BrandsCard } from './brands-card';
import { CustomDomainCard } from './custom-domain-card';
import { EmailHistoryCard } from './email-history-card';
import { NotificationsCard } from './notifications-card';

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage brands, notifications, branded domains, and delivery history."
      />
      <PageContent>
        <BrandsCard />
        <CustomDomainCard />
        <NotificationsCard />
        <EmailHistoryCard />
      </PageContent>
    </>
  );
}
