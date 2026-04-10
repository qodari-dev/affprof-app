import { PageLayout } from '@/components/sidebar/page-layout';
import { Dashboard } from './components/dashboard';

export default function DashboardRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}>
      <Dashboard />
    </PageLayout>
  );
}
