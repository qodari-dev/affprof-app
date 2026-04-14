import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { ProfilePage } from './components/profile-page';

export default async function ProfileRoute() {
  const t = await getTranslations('common');
  const tn = await getTranslations('nav');
  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tn('profile') }]}>
      <ProfilePage />
    </PageLayout>
  );
}
