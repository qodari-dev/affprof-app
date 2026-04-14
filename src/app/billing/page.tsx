import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { BillingPage } from './components/billing-page';

export default async function BillingRoute() {
  const t = await getTranslations('common');
  const tn = await getTranslations('nav');
  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tn('billing') }]}>
      <BillingPage />
    </PageLayout>
  );
}
