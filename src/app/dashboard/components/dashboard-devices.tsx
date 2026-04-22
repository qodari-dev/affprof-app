'use client';

import { Monitor, Smartphone, Tablet, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DeviceBreakdown } from '@/schemas/analytics';

interface DashboardDevicesProps {
  devices: DeviceBreakdown[];
}

const DEVICE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  mobile:  { icon: Smartphone, color: 'bg-blue-500' },
  desktop: { icon: Monitor,    color: 'bg-emerald-500' },
  tablet:  { icon: Tablet,     color: 'bg-violet-500' },
  unknown: { icon: HelpCircle, color: 'bg-neutral-400' },
};

function formatPercent(n: number) {
  return `${n.toFixed(0)}%`;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function DashboardDevices({ devices }: DashboardDevicesProps) {
  const t = useTranslations('dashboard.devices');

  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </CardHeader>
        <CardContent>
          <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = devices.reduce((a, d) => a + d.clicks, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {devices.map((d) => {
            const cfg = DEVICE_CONFIG[d.device] ?? DEVICE_CONFIG.unknown;
            return (
              <div
                key={d.device}
                className={cfg.color}
                style={{ width: `${Math.max(d.percentage, 0.5)}%` }}
                title={`${d.device}: ${formatPercent(d.percentage)}`}
              />
            );
          })}
        </div>

        {/* Legend rows */}
        <div className="flex flex-col gap-2">
          {devices.map((d) => {
            const cfg = DEVICE_CONFIG[d.device] ?? DEVICE_CONFIG.unknown;
            const Icon = cfg.icon;
            return (
              <div key={d.device} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.color}`} />
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="capitalize font-medium">{d.device}</span>
                </div>
                <span className="text-muted-foreground tabular-nums">
                  {formatNumber(d.clicks)} · {formatPercent(total > 0 ? (d.clicks / total) * 100 : 0)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
