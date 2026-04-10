import { PageLayout } from '@/components/sidebar/page-layout';
import { BillingPage } from './components/billing-page';

export default function BillingRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Billing' }]}>
      <BillingPage />
    </PageLayout>
  );
}
