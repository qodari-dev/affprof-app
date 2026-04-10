import { PageLayout } from '@/components/sidebar/page-layout';
import { Products } from './components/products';

export default function ProductsRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}>
      <Products />
    </PageLayout>
  );
}
