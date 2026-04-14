'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import type { Tags } from '@/server/db';
import { DataTableColumnHeader } from '@/components/data-table';
import { TagRowActions } from './tag-row-actions';
import { Badge } from '@/components/ui/badge';
import { TagBadge } from '@/components/tag-badge';
import { getTagSwatchStyle } from '@/utils/tag-color';

export function useTagColumns(): ColumnDef<Tags>[] {
  const tc = useTranslations('tags.columns');
  const t = useTranslations('tags');
  const locale = useLocale();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tc('name')} />,
      cell: ({ row }) => (
        <TagBadge name={row.original.name} color={row.original.color} className="gap-1.5 px-2.5 py-1 text-sm" />
      ),
    },
    {
      accessorKey: 'color',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tc('color')} enableHiding={false} />,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="inline-block h-3.5 w-3.5 rounded-full" style={getTagSwatchStyle(row.original.color)} />
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.color}</code>
        </div>
      ),
    },
    {
      id: 'linkedProducts',
      header: tc('linkedProducts'),
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original.linkTags?.length ?? 0;
        return (
          <Badge variant={count > 0 ? 'default' : 'outline'}>
            {t('linksCount', { count })}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tc('created')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ table, row }) => <TagRowActions row={row} table={table} />,
    },
  ];
}
