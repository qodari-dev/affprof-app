import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BadgeCheck, CreditCard } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('billing.success');
  return {
    title: t('metadataTitle'),
  };
}

export default async function BillingSuccessPage() {
  const t = await getTranslations('billing.success');

  return (
    <SidebarInset>
      <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
        <div className="flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <BadgeCheck className="h-8 w-8 text-emerald-600" />
          </div>

          <span className="mb-2 text-[5.5rem] font-black leading-none tracking-tighter text-foreground/10">
            {t('badge')}
          </span>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mb-4 max-w-md text-muted-foreground">
            {t('description')}
          </p>

          <div className="mb-8 rounded-2xl border bg-muted/25 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm ring-1 ring-border">
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t('whatHappensNext')}</p>
                <p>{t('whatHappensNextDesc1')}</p>
                <p>{t('whatHappensNextDesc2')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/billing"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToBilling')}
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}
            >
              {t('goToDashboard')}
            </Link>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
