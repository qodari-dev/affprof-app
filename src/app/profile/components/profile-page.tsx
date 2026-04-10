'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { ProfileCard } from './profile-card';
import { PasswordCard } from './password-card';

export function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal information and security."
      />
      <PageContent>
        <ProfileCard />
        <PasswordCard />
      </PageContent>
    </>
  );
}
