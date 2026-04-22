'use client';

import { ArrowDownRight, ArrowUpRight, Link2, MousePointerClick, Smartphone, Globe2 } from 'lucide-react';

function countryFlag(code: string) {
  if (!code || code.length !== 2) return '';
  const base = 0x1f1e6;
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(base + c.charCodeAt(0) - 65))
    .join('');
}
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardKpis } from '@/schemas/analytics';

interface DashboardKpisProps {
  kpis: DashboardKpis;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatPercent(n: number) {
  return `${n.toFixed(0)}%`;
}

function TrendBadge({ diffPercent, newLabel }: { diffPercent: number | null; newLabel: string }) {
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

function KpiCard({
  label,
  value,
  icon: Icon,
  sublabel,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  sublabel?: React.ReactNode;
  trend?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {trend}
        </div>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardKpisCards({ kpis }: DashboardKpisProps) {
  const t = useTranslations('dashboard.kpis');
  const tc = useTranslations('common');
  const { clicks, links, topCountry, mobileShare, qrShare } = kpis;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label={t('clicks')}
        value={formatNumber(clicks.value)}
        icon={MousePointerClick}
        trend={<TrendBadge diffPercent={clicks.diffPercent} newLabel={tc('new')} />}
        sublabel={
          clicks.diffPercent === null
            ? t('firstPeriod')
            : t('vsPrevious', { value: formatNumber(clicks.previousValue) })
        }
      />
      <KpiCard
        label={t('links')}
        value={
          <>
            {formatNumber(links.active)}
            <span className="text-muted-foreground text-base font-normal">
              {' '}/ {formatNumber(links.total)}
            </span>
          </>
        }
        icon={Link2}
        sublabel={
          links.broken > 0 ? (
            <span className="text-red-600 dark:text-red-500">
              {t('brokenCount', { count: links.broken })}
            </span>
          ) : (
            t('allHealthy')
          )
        }
      />
      <KpiCard
        label={t('topCountry')}
        value={
          topCountry
            ? <span className="flex items-center gap-2">{countryFlag(topCountry.code)} {topCountry.code}</span>
            : '—'
        }
        icon={Globe2}
        sublabel={
          topCountry
            ? `${formatPercent(topCountry.percentage)} ${t('ofClicks')}`
            : t('noData')
        }
      />
      <KpiCard
        label={t('mobileShare')}
        value={formatPercent(mobileShare)}
        icon={Smartphone}
        sublabel={
          qrShare > 0
            ? t('qrFromScans', { pct: qrShare.toFixed(0) })
            : t('desktopTablet', { pct: (100 - mobileShare).toFixed(0) })
        }
      />
    </div>
  );
}
