import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { Dashboard } from './components/dashboard';

export default async function DashboardRoute() {
  const t = await getTranslations('common');
  const td = await getTranslations('nav');

  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: td('dashboard') }]}>
      <Dashboard />
    </PageLayout>
  );
}
