import { PageLayout } from '@/components/sidebar/page-layout';
import { Tags } from './components/tags';

export default function TagsRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tags' }]}>
      <Tags />
    </PageLayout>
  );
}
