'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TrafficSource } from '@/schemas/analytics';

interface DashboardSourcesProps {
  sources: TrafficSource[];
}

// Consistent color per source label
const SOURCE_COLORS: Record<string, string> = {
  youtube: 'bg-red-500',
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  tiktok: 'bg-neutral-800 dark:bg-neutral-200',
  direct: 'bg-emerald-500',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  other: 'bg-neutral-400',
};

function colorFor(source: string) {
  return SOURCE_COLORS[source.toLowerCase()] ?? 'bg-neutral-400';
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function DashboardSources({ sources }: DashboardSourcesProps) {
  const t = useTranslations('dashboard.sources');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sources.map((source) => (
              <div key={source.source} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{source.source}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(source.clicks)} · {source.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', colorFor(source.source))}
                    style={{ width: `${Math.max(source.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
