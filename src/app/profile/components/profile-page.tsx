'use client';

import { useTranslations } from 'next-intl';
import { PageHeader, PageContent } from '@/components/layout';
import { ProfileCard } from './profile-card';
import { PasswordCard } from './password-card';
import { DeleteAccountCard } from './delete-account-card';

export function ProfilePage() {
  const t = useTranslations('profile');

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <PageContent>
        <ProfileCard />
        <PasswordCard />
        <DeleteAccountCard />
      </PageContent>
    </>
  );
}
