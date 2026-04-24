import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, CircleSlash } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('billing.canceled');
  return {
    title: t('metadataTitle'),
  };
}

export default async function BillingCanceledPage() {
  const t = await getTranslations('billing.canceled');

  return (
    <SidebarInset>
      <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
        <div className="flex max-w-xl flex-col items-center text-center">

          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CircleSlash className="h-8 w-8 text-muted-foreground" />
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mb-8 max-w-md text-muted-foreground">{t('description')}</p>

          <div className="mb-8 w-full rounded-2xl border bg-muted/25 p-5 text-left">
            <p className="mb-1 text-sm font-semibold text-foreground">{t('freeTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('freeDesc')}</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/billing"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('tryAgainCta')}
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              {t('continueFree')}
            </Link>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
