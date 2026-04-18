import { PageLayout } from '@/components/sidebar/page-layout';
import { HomeContent } from './components/home-content';

export default function HomePage() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home' }]}>
      <HomeContent />
    </PageLayout>
  );
}
