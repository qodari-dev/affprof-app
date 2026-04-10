'use client';

import { useRouter } from 'next/navigation';
import type { Row, Table } from '@tanstack/react-table';
import { Activity, ArrowRight, Edit, Eye, Loader2, MoreHorizontal, Trash } from 'lucide-react';
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
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {onRowView && (
            <DropdownMenuItem onClick={() => onRowView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
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
              Check all links ({linkIds.length})
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(`/links?productId=${row.original.id}`)}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to links
          </DropdownMenuItem>
          {onRowEdit && (
            <DropdownMenuItem onClick={() => onRowEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
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
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
