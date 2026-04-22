'use client';

import { Activity, AlertTriangle, Timer, GitBranch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DashboardHealthStats as HealthStatsType } from '@/schemas/analytics';

interface DashboardHealthStatsProps {
  stats: HealthStatsType;
}

function StatItem({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-semibold tabular-nums', valueClass)}>{value}</p>
      </div>
    </div>
  );
}

export function DashboardHealthStats({ stats }: DashboardHealthStatsProps) {
  const t = useTranslations('dashboard.healthStats');

  const uptimeClass =
    stats.uptimePercent >= 95
      ? 'text-emerald-600 dark:text-emerald-500'
      : stats.uptimePercent >= 80
        ? 'text-amber-600 dark:text-amber-500'
        : 'text-red-600 dark:text-red-500';

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('sectionTitle')}
      </p>
      <div className={cn('grid grid-cols-2 gap-3', stats.fallbackClicks > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        <StatItem
          icon={Activity}
          label={t('uptime')}
          value={`${stats.uptimePercent.toFixed(1)}%`}
          valueClass={uptimeClass}
        />
        <StatItem
          icon={Timer}
          label={t('avgResponse')}
          value={stats.avgResponseMs != null ? `${stats.avgResponseMs}ms` : '—'}
        />
        <StatItem
          icon={AlertTriangle}
          label={t('checks')}
          value={`${stats.totalChecks - stats.failedChecks} / ${stats.totalChecks}`}
        />
        {stats.fallbackClicks > 0 && (
          <StatItem
            icon={GitBranch}
            label={t('fallback')}
            value={`${stats.fallbackClicks} (${stats.fallbackShare.toFixed(0)}%)`}
            valueClass="text-amber-600 dark:text-amber-500"
          />
        )}
      </div>
    </div>
  );
}
