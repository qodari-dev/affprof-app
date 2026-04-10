import { PageLayout } from '@/components/sidebar/page-layout';
import { SettingsPage } from './components/settings-page';

export default function SettingsRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}>
      <SettingsPage />
    </PageLayout>
  );
}
