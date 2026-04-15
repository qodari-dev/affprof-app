'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errorPages.serverError');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 dark:bg-red-500/20">
          <Zap className="h-8 w-8 text-red-500" />
        </div>

        {/* Big 500 */}
        <span className="mb-2 text-[8rem] font-black leading-none tracking-tighter text-foreground/10 dark:text-foreground/15">
          500
        </span>

        {/* Text */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mb-2 max-w-sm text-muted-foreground">
          {t('description')}
        </p>

        {/* Dev error detail */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <code className="mb-6 inline-block max-w-sm rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500 dark:border-red-500/30 dark:bg-red-500/10">
            {error.message}
          </code>
        )}

        {!error.message && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={reset} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('tryAgain')}
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('goHome')}
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground/60">{t('errorId', { digest: error.digest })}</p>
        )}
      </div>
    </div>
  );
}
