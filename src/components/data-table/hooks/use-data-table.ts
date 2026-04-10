'use client';

import * as React from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

// ============================================================================
// Types
// ============================================================================

export interface SortItem<TField extends string = string> {
  field: TField;
  order: 'asc' | 'desc';
}

export type WhereFilter = Record<string, unknown>;

export interface WhereClause {
  and?: WhereFilter[];
  or?: WhereFilter[];
}

export interface UseDataTableOptions<
  TSortField extends string = string,
  TInclude extends string = string,
> {
  defaultPageSize?: number;
  defaultSorting?: SortItem<TSortField>[];
  defaultIncludes?: TInclude[];
  debounceMs?: number;
  syncWithUrl?: boolean;
}

export interface UseDataTableReturn<
  TSortField extends string = string,
  TInclude extends string = string,
> {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  searchValue: string;
  filters: Record<string, unknown>;
  queryParams: {
    page: number;
    limit: number;
    search?: string;
    sort?: SortItem<TSortField>[];
    where?: WhereClause;
    include?: TInclude[];
  };
  handlePaginationChange: (pageIndex: number, pageSize: number) => void;
  handleSortingChange: (sorting: SortingState) => void;
  handleSearchChange: (value: string) => void;
  handleFilterChange: (key: string, value: unknown) => void;
  setWhereFilter: (field: string, value: unknown) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function tanstackToSort<TField extends string>(sorting: SortingState): SortItem<TField>[] {
  return sorting.map((s) => ({
    field: s.id as TField,
    order: s.desc ? 'desc' : 'asc',
  }));
}

function sortToTanstack<TField extends string>(sort: SortItem<TField>[]): SortingState {
  return sort.map((s) => ({
    id: s.field,
    desc: s.order === 'desc',
  }));
}

function parseFiltersFromSearchParams(searchParams: URLSearchParams): Record<string, unknown> {
  const reservedKeys = new Set(['page', 'limit', 'sortField', 'sortOrder', 'search']);
  const parsed: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    if (reservedKeys.has(key) || !value) return;

    if (value === 'true') {
      parsed[key] = true;
      return;
    }

    if (value === 'false') {
      parsed[key] = false;
      return;
    }

    if (value.includes(',')) {
      parsed[key] = { in: value.split(',').filter(Boolean) };
      return;
    }

    parsed[key] = value;
  });

  return parsed;
}

// ============================================================================
// Hook
// ============================================================================

export function useDataTable<TSortField extends string = string, TInclude extends string = string>({
  defaultPageSize = 20,
  defaultSorting = [],
  defaultIncludes = [],
  debounceMs = 300,
  syncWithUrl = true,
}: UseDataTableOptions<TSortField, TInclude> = {}): UseDataTableReturn<TSortField, TInclude> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pageIndex, setPageIndex] = React.useState(() => {
    if (!syncWithUrl) return 0;
    const page = searchParams.get('page');
    return page ? Math.max(0, parseInt(page) - 1) : 0;
  });

  const [pageSize, setPageSize] = React.useState(() => {
    if (!syncWithUrl) return defaultPageSize;
    const size = searchParams.get('limit');
    return size ? parseInt(size) : defaultPageSize;
  });

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    if (!syncWithUrl) return sortToTanstack(defaultSorting);
    const sortField = searchParams.get('sortField');
    const sortOrder = searchParams.get('sortOrder');
    if (sortField) {
      return [{ id: sortField, desc: sortOrder === 'desc' }];
    }
    return sortToTanstack(defaultSorting);
  });

  const [searchValue, setSearchValue] = React.useState(() => {
    if (!syncWithUrl) return '';
    return searchParams.get('search') ?? '';
  });

  const [filters, setFilters] = React.useState<Record<string, unknown>>(() => {
    if (!syncWithUrl) return {};
    return parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString()));
  });
  const [includes] = React.useState<string[]>(defaultIncludes);

  // ---- URL Sync ----

  const updateURL = React.useCallback(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams();

    if (pageIndex > 0) params.set('page', (pageIndex + 1).toString());
    if (pageSize !== defaultPageSize) params.set('limit', pageSize.toString());

    if (sorting.length > 0) {
      params.set('sortField', sorting[0].id);
      params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }

    if (searchValue) params.set('search', searchValue);

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'object' && value !== null) {
        if ('in' in value && Array.isArray((value as { in: unknown[] }).in)) {
          params.set(key, (value as { in: string[] }).in.join(','));
        }
      } else if (typeof value === 'boolean') {
        params.set(key, value.toString());
      } else if (typeof value === 'string' && value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [syncWithUrl, pathname, router, pageIndex, pageSize, defaultPageSize, sorting, searchValue, filters]);

  const debouncedUpdateURL = useDebouncedCallback(updateURL, debounceMs);

  React.useEffect(() => {
    updateURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, sorting, filters]);

  // ---- Handlers ----

  const handlePaginationChange = React.useCallback(
    (newPageIndex: number, newPageSize: number) => {
      if (newPageSize !== pageSize) {
        setPageIndex(0);
      } else {
        setPageIndex(newPageIndex);
      }
      setPageSize(newPageSize);
    },
    [pageSize],
  );

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPageIndex(0);
  }, []);

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchValue(value);
      setPageIndex(0);
      debouncedUpdateURL();
    },
    [debouncedUpdateURL],
  );

  const handleFilterChange = React.useCallback((key: string, value: unknown) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === '') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPageIndex(0);
  }, []);

  const setWhereFilter = React.useCallback(
    (field: string, value: unknown) => handleFilterChange(field, value),
    [handleFilterChange],
  );

  const resetFilters = React.useCallback(() => {
    setSearchValue('');
    setFilters({});
    setPageIndex(0);
  }, []);

  const resetAll = React.useCallback(() => {
    setPageIndex(0);
    setPageSize(defaultPageSize);
    setSorting(sortToTanstack(defaultSorting));
    setSearchValue('');
    setFilters({});
  }, [defaultPageSize, defaultSorting]);

  // ---- Build Query Params ----

  const queryParams = React.useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      sort?: SortItem<TSortField>[];
      where?: WhereClause;
      include?: TInclude[];
    } = {
      page: pageIndex + 1,
      limit: pageSize,
    };

    if (searchValue) params.search = searchValue;

    if (sorting.length > 0) {
      params.sort = tanstackToSort<TSortField>(sorting);
    }

    const filterEntries = Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    );
    if (filterEntries.length > 0) {
      params.where = {
        and: filterEntries.map(([key, value]) => ({ [key]: value })),
      };
    }

    if (includes.length > 0) {
      params.include = includes as TInclude[];
    }

    return params;
  }, [pageIndex, pageSize, searchValue, sorting, filters, includes]);

  return {
    pageIndex,
    pageSize,
    sorting,
    searchValue,
    filters,
    queryParams,
    handlePaginationChange,
    handleSortingChange,
    handleSearchChange,
    handleFilterChange,
    setWhereFilter,
    resetFilters,
    resetAll,
  };
}
