'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, HelpCircle, Pause } from 'lucide-react';

const STATUS_CONFIG = {
  active: {
    key: 'active' as const,
    icon: CheckCircle,
    className: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
  },
  broken: {
    key: 'broken' as const,
    icon: AlertTriangle,
    className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  },
  unknown: {
    key: 'unknown' as const,
    icon: HelpCircle,
    className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
  },
} as const;

export function LinkStatusBadge({
  status,
  isEnabled,
}: {
  status: string;
  isEnabled: boolean;
}) {
  const t = useTranslations('links.status');

  if (!isEnabled) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
        <Pause className="h-3 w-3" />
        {t('disabled')}
      </Badge>
    );
  }

  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {t(config.key)}
    </Badge>
  );
}
