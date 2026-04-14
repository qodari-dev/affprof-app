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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('links.rowActions');
  const tc = useTranslations('common');
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
          <DropdownMenuItem
            onClick={() => window.open(row.original.originalUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('openDestination')}
          </DropdownMenuItem>
          {onRowQr && (
            <DropdownMenuItem onClick={() => onRowQr(row.original)}>
              <QrCode className="mr-2 h-4 w-4" />
              {t('qrCode')}
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
            {t('checkLink')}
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
            {row.original.isEnabled ? t('disableLink') : t('enableLink')}
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
