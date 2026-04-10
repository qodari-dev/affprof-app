'use client';

import type { Row, Table } from '@tanstack/react-table';
import {
  Activity,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  MoreHorizontal,
  Power,
  PowerOff,
  QrCode,
  Trash,
} from 'lucide-react';
import type { Links } from '@/server/db';

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
import { useCheckLink, useUpdateLink } from '@/hooks/queries/use-link-queries';

interface LinkRowActionsProps {
  row: Row<Links>;
  table: Table<Links>;
}

export function LinkRowActions({ row, table }: LinkRowActionsProps) {
  const { onRowView, onRowEdit, onRowDelete, onRowQr } = (table.options.meta ?? {}) as {
    onRowView?: (link: Links) => void;
    onRowEdit?: (link: Links) => void;
    onRowDelete?: (link: Links) => void;
    onRowQr?: (link: Links) => void;
  };

  const { mutate: checkLink, isPending: isChecking } = useCheckLink();
  const { mutate: updateLink, isPending: isUpdating } = useUpdateLink();

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
          <DropdownMenuItem
            onClick={() => window.open(row.original.originalUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open original URL
          </DropdownMenuItem>
          {onRowQr && (
            <DropdownMenuItem onClick={() => onRowQr(row.original)}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => checkLink({ params: { id: row.original.id } })}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Check link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateLink({
                params: { id: row.original.id },
                body: { isEnabled: !row.original.isEnabled },
              })
            }
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : row.original.isEnabled ? (
              <PowerOff className="mr-2 h-4 w-4" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            {row.original.isEnabled ? 'Disable link' : 'Enable link'}
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
