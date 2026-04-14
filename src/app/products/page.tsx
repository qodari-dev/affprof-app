import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { Products } from './components/products';

export default async function ProductsRoute() {
  const t = await getTranslations('common');
  const tp = await getTranslations('products');

  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tp('title') }]}>
      <Products />
    </PageLayout>
  );
}
