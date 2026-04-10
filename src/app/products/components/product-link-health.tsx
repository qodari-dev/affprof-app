'use client';

import type { Links } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function summarizeProductLinks(links: Links[] = []) {
  return links.reduce(
    (summary, link) => {
      summary.total += 1;

      if (!link.isEnabled) {
        summary.disabled += 1;
        return summary;
      }

      if (link.status === 'active') {
        summary.active += 1;
        return summary;
      }

      if (link.status === 'broken') {
        summary.broken += 1;
        return summary;
      }

      summary.unknown += 1;
      return summary;
    },
    {
      total: 0,
      active: 0,
      broken: 0,
      unknown: 0,
      disabled: 0,
    },
  );
}

function SummaryBadge({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  if (count <= 0) return null;

  return (
    <Badge variant="outline" className={cn('gap-1 rounded-md px-2 py-0.5 font-normal', className)}>
      <span className="font-semibold">{count}</span>
      <span>{label}</span>
    </Badge>
  );
}

export function ProductLinkHealth({
  links,
  compact = false,
}: {
  links?: Links[];
  compact?: boolean;
}) {
  const summary = summarizeProductLinks(links);

  if (summary.total === 0) {
    return (
      <Badge variant="outline" className="rounded-md px-2 py-0.5 font-normal text-muted-foreground">
        No links
      </Badge>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'max-w-[280px]')}>
      <SummaryBadge
        label="active"
        count={summary.active}
        className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
      />
      <SummaryBadge
        label="broken"
        count={summary.broken}
        className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
      />
      <SummaryBadge
        label="unknown"
        count={summary.unknown}
        className="border-muted-foreground/30 bg-muted text-muted-foreground"
      />
      <SummaryBadge
        label="disabled"
        count={summary.disabled}
        className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      />
    </div>
  );
}
