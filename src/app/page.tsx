import { PageLayout } from '@/components/sidebar/page-layout';

export default function HomePage() {
  return (
    <PageLayout breadcrumbs={[{ label: 'Home' }]}>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Welcome to AffProf</p>
      </div>
    </PageLayout>
  );
}
