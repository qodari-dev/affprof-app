'use client';

import type { Row, Table } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Tags } from '@/server/db';

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

interface TagRowActionsProps {
  row: Row<Tags>;
  table: Table<Tags>;
}

export function TagRowActions({ row, table }: TagRowActionsProps) {
  const tc = useTranslations('common');
  const { onRowView, onRowEdit, onRowDelete } = (table.options.meta ?? {}) as {
    onRowView?: (tag: Tags) => void;
    onRowEdit?: (tag: Tags) => void;
    onRowDelete?: (tag: Tags) => void;
  };

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
