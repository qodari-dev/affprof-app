'use client';

import { useTranslations } from 'next-intl';
import { PageHeader, PageContent } from '@/components/layout';
import { BrandsCard } from './brands-card';
import { CustomDomainCard } from './custom-domain-card';
import { EmailHistoryCard } from './email-history-card';
import { FallbackUrlCard } from './fallback-url-card';
import { NotificationsCard } from './notifications-card';

export function SettingsPage() {
  const t = useTranslations('settings');

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <PageContent>
        <BrandsCard />
        <CustomDomainCard />
        <FallbackUrlCard />
        <NotificationsCard />
        <EmailHistoryCard />
      </PageContent>
    </>
  );
}
