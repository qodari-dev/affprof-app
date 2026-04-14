'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import type { Products } from '@/server/db';
import { DataTableColumnHeader } from '@/components/data-table';
import { ProductRowActions } from './product-row-actions';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from './product-image';
import { ProductLinkHealth, summarizeProductLinks } from './product-link-health';

export function useProductColumns(): ColumnDef<Products>[] {
  const t = useTranslations('products');
  const tc = useTranslations('products.columns');
  const locale = useLocale();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tc('name')} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <ProductImage
            src={row.original.imageUrl}
            alt={row.original.name}
            className="h-10 w-10 shrink-0 rounded-md border bg-muted/30"
          />
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="max-w-[300px] truncate text-xs text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'links',
      header: tc('links'),
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original.links?.length ?? 0;
        const summary = summarizeProductLinks(row.original.links);

        return (
          <div className="flex flex-col gap-2">
            <Badge variant={count > 0 ? 'default' : 'outline'} className="w-fit">
              {t('linksCount', { count })}
            </Badge>
            {summary.total > 0 ? <ProductLinkHealth links={row.original.links} compact /> : null}
          </div>
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
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tc('updated')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.updatedAt
            ? new Date(row.original.updatedAt).toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ table, row }) => <ProductRowActions row={row} table={table} />,
    },
  ];
}
