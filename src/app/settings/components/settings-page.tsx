'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { EmailHistoryCard } from './email-history-card';
import { NotificationsCard } from './notifications-card';

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure your notification preferences."
      />
      <PageContent>
        <NotificationsCard />
        <EmailHistoryCard />
      </PageContent>
    </>
  );
}
