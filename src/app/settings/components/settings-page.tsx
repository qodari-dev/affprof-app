'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { CustomDomainCard } from './custom-domain-card';
import { EmailHistoryCard } from './email-history-card';
import { NotificationsCard } from './notifications-card';

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage notifications, branded domains, and delivery history."
      />
      <PageContent>
        <CustomDomainCard />
        <NotificationsCard />
        <EmailHistoryCard />
      </PageContent>
    </>
  );
}
