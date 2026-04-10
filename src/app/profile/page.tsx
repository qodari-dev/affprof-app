import { PageLayout } from '@/components/sidebar/page-layout';
import { ProfilePage } from './components/profile-page';

export default function ProfileRoute() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]}>
      <ProfilePage />
    </PageLayout>
  );
}
