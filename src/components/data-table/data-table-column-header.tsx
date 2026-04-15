'use client';

import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// Props
// ============================================================================

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  enableHiding?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableHiding = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations('dataTable');

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="data-[state=open]:bg-accent -ml-3 h-9 px-3">
              <span>{title}</span>
              {column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
              {t('sortAsc')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
              {t('sortDesc')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {enableHiding && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                  <EyeOff className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
                  {t('hide')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
