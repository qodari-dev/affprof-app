'use client';

import { Badge } from '@/components/ui/badge';
import { getTagBadgeStyle, getTagSwatchStyle } from '@/utils/tag-color';

export function TagBadge({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={className ?? 'gap-1.5 text-xs'} style={getTagBadgeStyle(color)}>
      <span className="inline-block h-2 w-2 rounded-full" style={getTagSwatchStyle(color)} />
      {name}
    </Badge>
  );
}
