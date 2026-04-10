'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  isRefreshing?: boolean;
}

export function ProductToolbar({
  searchValue,
  onSearchChange,
  onRefresh,
  onCreate,
  isRefreshing,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-2 lg:flex-row lg:items-center">
        <Input
          placeholder="Search products..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="md:max-w-xs"
        />
      </div>

      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        )}

        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New product
          </Button>
        )}
      </div>
    </div>
  );
}
