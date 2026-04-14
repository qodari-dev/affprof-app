import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/sidebar/page-layout';
import { Tags } from './components/tags';

export default async function TagsRoute() {
  const t = await getTranslations('common');
  const tt = await getTranslations('tags');

  return (
    <PageLayout breadcrumbs={[{ label: t('home'), href: '/' }, { label: tt('title') }]}>
      <Tags />
    </PageLayout>
  );
}
