import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Link2Off, Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import logoLight from '../../../public/logo-fondo-blanco.png';
import logoDark from '../../../public/logo-fondo-negro.png';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('linkUnavailable');
  return {
    title: t('metadataTitle'),
  };
}

export default async function LinkUnavailablePage() {
  const t = await getTranslations('linkUnavailable');

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-10">
      <div className="mb-10">
        <Image
          src={logoLight}
          alt="AffProf"
          className="block h-8 w-auto object-contain dark:hidden"
          sizes="140px"
          priority
        />
        <Image
          src={logoDark}
          alt="AffProf"
          className="hidden h-8 w-auto object-contain dark:block"
          sizes="140px"
          priority
        />
      </div>

      <div className="flex max-w-xl flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 dark:bg-red-500/20">
          <Link2Off className="h-8 w-8 text-red-500" />
        </div>

        <span className="mb-2 text-[5.5rem] font-black leading-none tracking-tighter text-red-500/20 dark:text-red-400/30">
          {t('badge')}
        </span>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mb-4 max-w-md text-muted-foreground">{t('description')}</p>

        <div className="mb-8 rounded-2xl border bg-muted/25 p-4 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm ring-1 ring-border">
              <Info className="h-4 w-4 text-red-500" />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t('infoTitle')}</p>
              <p>{t('infoDesc')}</p>
            </div>
          </div>
        </div>

        <Link
          href="https://affprof.com"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          {t('discoverAffProf')}
        </Link>
      </div>
    </main>
  );
}
