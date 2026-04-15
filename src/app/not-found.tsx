import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Search } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('errorPages.notFound');
  return {
    title: t('metadataTitle'),
  };
}

export default async function NotFoundPage() {
  const t = await getTranslations('errorPages.notFound');

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Search className="h-8 w-8 text-primary" />
        </div>

        {/* Big 404 */}
        <span className="mb-2 text-[8rem] font-black leading-none tracking-tighter text-foreground/10 dark:text-foreground/15">
          404
        </span>

        {/* Text */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mb-8 max-w-sm text-muted-foreground">
          {t('description')}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('goBack')}
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {t('dashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
