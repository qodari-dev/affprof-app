'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TopPlatform } from '@/schemas/analytics';

interface DashboardTopPlatformsProps {
  topPlatforms: TopPlatform[];
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function TrendCell({ diffPercent, newLabel }: { diffPercent: number | null; newLabel: string }) {
  if (diffPercent === null) {
    return <span className="text-xs text-muted-foreground">{newLabel}</span>;
  }
  const up = diffPercent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        up ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500',
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(diffPercent).toFixed(0)}%
    </span>
  );
}

export function DashboardTopPlatforms({ topPlatforms }: DashboardTopPlatformsProps) {
  const t = useTranslations('dashboard.topPlatforms');
  const tc = useTranslations('common');

  const maxClicks = topPlatforms[0]?.clicks ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent>
        {topPlatforms.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {topPlatforms.map((p) => (
              <div key={p.platform} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{p.platform}</span>
                  <div className="flex items-center gap-2">
                    <TrendCell diffPercent={p.diffPercent} newLabel={tc('new')} />
                    <span className="text-muted-foreground tabular-nums">
                      {formatNumber(p.clicks)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max((p.clicks / maxClicks) * 100, 2)}%` }}
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
