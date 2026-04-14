import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { SettingsPage } from './components/settings-page';

export default async function SettingsRoute() {
  const t = await getTranslations('common');
  const tn = await getTranslations('nav');
  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tn('settings') }]}>
      <SettingsPage />
    </PageLayout>
  );
}
