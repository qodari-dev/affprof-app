import Link from 'next/link';
import type { Metadata } from 'next';
import { BadgeCheck, Link2, BarChart2, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import { RedirectCountdown } from '@/components/redirect-countdown';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('billing.success');
  return {
    title: t('metadataTitle'),
  };
}

export default async function BillingSuccessPage() {
  const t = await getTranslations('billing.success');

  const features = [
    { icon: Link2, label: t('feature1') },
    { icon: BarChart2, label: t('feature2') },
    { icon: ShieldCheck, label: t('feature3') },
  ];

  return (
    <SidebarInset>
      <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-lg flex-col items-center text-center">

          {/* Icon */}
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <BadgeCheck className="h-10 w-10 text-emerald-600" />
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mb-8 max-w-md text-muted-foreground">
            {t('description')}
          </p>

          {/* Features unlocked */}
          <div className="mb-8 w-full rounded-2xl border bg-muted/25 p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">{t('unlockedTitle')}</p>
            <ul className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className={cn(buttonVariants({ size: 'lg' }), 'mb-4 w-full sm:w-auto')}
          >
            {t('cta')}
          </Link>

          {/* Countdown */}
          <RedirectCountdown to="/" seconds={10} namespace="billing.success" labelKey="redirecting" />
        </div>
      </main>
    </SidebarInset>
  );
}
