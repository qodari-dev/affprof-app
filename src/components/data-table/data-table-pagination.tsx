'use client';

import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

// ============================================================================
// Props
// ============================================================================

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalCount?: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showSelectedCount?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function DataTablePagination<TData>({
  table,
  pageCount,
  pageIndex,
  pageSize,
  totalCount,
  onPaginationChange,
  pageSizeOptions = [10, 20, 30, 50],
  showSelectedCount = true,
}: DataTablePaginationProps<TData>) {
  const t = useTranslations('dataTable');
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const rowCount = table.getFilteredRowModel().rows.length;

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalCount ?? rowCount);

  return (
    <div className="flex flex-col justify-between gap-2 px-2 lg:flex-row lg:items-center">
      {/* Left side */}
      <div className="flex-1 text-sm text-muted-foreground">
        {showSelectedCount && selectedCount > 0 ? (
          <span>
            {t('selectedRows', { selected: selectedCount, total: rowCount })}
          </span>
        ) : totalCount ? (
          <span>
            {t('showingResults', { start: startRow, end: endRow, total: totalCount })}
          </span>
        ) : null}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page */}
        <div className="flex flex-col items-center gap-2 lg:flex-row">
          <p className="text-sm font-medium">{t('rowsPerPage')}</p>
          <select
            className="flex h-9 w-[76px] rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
            value={`${pageSize}`}
            onChange={(e) => onPaginationChange(0, Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={`${size}`}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page info */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('pageOf', { current: pageIndex + 1, total: pageCount || 1 })}
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={() => onPaginationChange(0, pageSize)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">{t('firstPage')}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => onPaginationChange(pageIndex - 1, pageSize)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">{t('previousPage')}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => onPaginationChange(pageIndex + 1, pageSize)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">{t('nextPage')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={() => onPaginationChange(pageCount - 1, pageSize)}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">{t('lastPage')}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
