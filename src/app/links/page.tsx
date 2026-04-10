import { PageLayout } from '@/components/sidebar/page-layout';
import { Links } from './components/links';

export default function LinksRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Links' }]}>
      <Links />
    </PageLayout>
  );
}
