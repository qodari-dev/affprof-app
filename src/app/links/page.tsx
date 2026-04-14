import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { Links } from './components/links';

export default async function LinksRoute() {
  const t = await getTranslations('common');
  const tl = await getTranslations('links');

  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tl('title') }]}>
      <Links />
    </PageLayout>
  );
}
