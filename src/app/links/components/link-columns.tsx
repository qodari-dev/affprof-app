'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Links } from '@/server/db';
import { DataTableColumnHeader } from '@/components/data-table';
import { LinkRowActions } from './link-row-actions';
import { Badge } from '@/components/ui/badge';
import { LinkStatusBadge } from './link-status-badge';
import { ExternalLink, CornerDownRight, Palette } from 'lucide-react';
import { TagBadge } from '@/components/tag-badge';

export const linkColumns: ColumnDef<Links>[] = [
  {
    accessorKey: 'slug',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium font-mono text-sm">/{row.original.slug}</span>
        <span className="flex items-center gap-1 max-w-[250px] truncate text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3 shrink-0" />
          {row.original.originalUrl}
        </span>
        {row.original.fallbackUrl ? (
          <span className="flex items-center gap-1 max-w-[250px] truncate text-xs text-amber-700 dark:text-amber-300">
            <CornerDownRight className="h-3 w-3 shrink-0" />
            {row.original.fallbackUrl}
          </span>
        ) : null}
        {row.original.brand ? (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            <Palette className="h-3 w-3 shrink-0" />
            {row.original.brand.name}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    id: 'product',
    header: 'Product',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.product?.name ?? <span className="text-muted-foreground">&mdash;</span>}
      </span>
    ),
  },
  {
    accessorKey: 'platform',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.platform}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <LinkStatusBadge status={row.original.status} isEnabled={row.original.isEnabled} />,
  },
  {
    id: 'tags',
    header: 'Tags',
    enableSorting: false,
    cell: ({ row }) => {
      const tags = row.original.linkTags
        ?.map((lt) => lt.tag)
        .filter(Boolean) ?? [];
      if (tags.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <TagBadge key={tag!.id} name={tag!.name} color={tag!.color} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'totalClicks',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clicks" />,
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{row.original.totalClicks.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ table, row }) => <LinkRowActions row={row} table={table} />,
  },
];
