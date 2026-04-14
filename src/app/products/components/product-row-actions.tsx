'use client';

import { useRouter } from 'next/navigation';
import type { Row, Table } from '@tanstack/react-table';
import { Activity, ArrowRight, Edit, Eye, Loader2, MoreHorizontal, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Products } from '@/server/db';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCheckLinks } from '@/hooks/queries/use-link-queries';

interface ProductRowActionsProps {
  row: Row<Products>;
  table: Table<Products>;
}

export function ProductRowActions({ row, table }: ProductRowActionsProps) {
  const router = useRouter();
  const t = useTranslations('products.rowActions');
  const tc = useTranslations('common');
  const { onRowView, onRowEdit, onRowDelete } = (table.options.meta ?? {}) as {
    onRowView?: (product: Products) => void;
    onRowEdit?: (product: Products) => void;
    onRowDelete?: (product: Products) => void;
  };

  const { mutate: checkLinks, isPending: isChecking } = useCheckLinks();

  const linkIds = row.original.links?.map((l) => l.id) ?? [];
  const hasLinks = linkIds.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{tc('actions')}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{tc('actions')}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {onRowView && (
            <DropdownMenuItem onClick={() => onRowView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              {tc('viewDetails')}
            </DropdownMenuItem>
          )}
          {hasLinks && (
            <DropdownMenuItem
              onClick={() => checkLinks({ body: { linkIds } })}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Activity className="mr-2 h-4 w-4" />
              )}
              {t('checkLinks', { count: linkIds.length })}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(`/links?productId=${row.original.id}`)}>
            <ArrowRight className="mr-2 h-4 w-4" />
            {t('goToLinks')}
          </DropdownMenuItem>
          {onRowEdit && (
            <DropdownMenuItem onClick={() => onRowEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              {tc('edit')}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {onRowDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onRowDelete(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                {tc('delete')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
