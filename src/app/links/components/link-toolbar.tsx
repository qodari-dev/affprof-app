'use client';

import * as React from 'react';
import { Check, FileUp, Plus, PlusCircle, RefreshCw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

interface ToolbarSelectFilterProps {
  title: string;
  value?: string;
  options: FilterOption[];
  onValueChange: (value: string | undefined) => void;
  clearFilterLabel: string;
  noResultsLabel: string;
}

function ToolbarSelectFilter({
  title,
  value,
  options,
  onValueChange,
  clearFilterLabel,
  noResultsLabel,
}: ToolbarSelectFilterProps) {
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="h-10 border-dashed px-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            {title}
            {selectedOption && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="max-w-[140px] gap-1 truncate rounded-sm px-1 font-normal">
                  {selectedOption.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedOption.color }}
                    />
                  )}
                  <span className="truncate">{selectedOption.label}</span>
                </Badge>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`${title}...`} />
          <CommandList>
            <CommandEmpty>{noResultsLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onValueChange(isSelected ? undefined : option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50',
                      )}
                    >
                      <Check className={cn('h-3 w-3', !isSelected && 'invisible')} />
                    </div>
                    {option.color && (
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {value && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onValueChange(undefined)} className="justify-center">
                    {clearFilterLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface LinkToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  productFilter?: string;
  productOptions: FilterOption[];
  onProductFilterChange: (value: string | undefined) => void;
  statusFilter?: string;
  statusOptions: FilterOption[];
  onStatusFilterChange: (value: string | undefined) => void;
  tagFilter?: string;
  tagOptions: FilterOption[];
  onTagFilterChange: (value: string | undefined) => void;
  onReset: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  isRefreshing?: boolean;
}

export function LinkToolbar({
  searchValue,
  onSearchChange,
  productFilter,
  productOptions,
  onProductFilterChange,
  statusFilter,
  statusOptions,
  onStatusFilterChange,
  tagFilter,
  tagOptions,
  onTagFilterChange,
  onReset,
  onRefresh,
  onCreate,
  onImport,
  isRefreshing,
}: LinkToolbarProps) {
  const t = useTranslations('links');
  const tf = useTranslations('links.filters');
  const tc = useTranslations('common');
  const hasActiveFilters = Boolean(searchValue || productFilter || statusFilter || tagFilter);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-2 lg:flex-row lg:items-center lg:flex-wrap">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="md:max-w-xs"
        />
        <ToolbarSelectFilter
          title={tf('product')}
          value={productFilter}
          options={productOptions}
          onValueChange={onProductFilterChange}
          clearFilterLabel={tc('clearFilter')}
          noResultsLabel={tc('noResultsFound')}
        />
        <ToolbarSelectFilter
          title={tf('status')}
          value={statusFilter}
          options={statusOptions}
          onValueChange={onStatusFilterChange}
          clearFilterLabel={tc('clearFilter')}
          noResultsLabel={tc('noResultsFound')}
        />
        <ToolbarSelectFilter
          title={tf('tag')}
          value={tagFilter}
          options={tagOptions}
          onValueChange={onTagFilterChange}
          clearFilterLabel={tc('clearFilter')}
          noResultsLabel={tc('noResultsFound')}
        />
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset} className="h-10 px-3.5">
            {tc('clear')}
            <X className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
            {tc('refresh')}
          </Button>
        )}

        {onImport && (
          <Button variant="outline" onClick={onImport}>
            <FileUp className="mr-2 h-4 w-4" />
            {tc('importCsv')}
          </Button>
        )}

        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newLink')}
          </Button>
        )}
      </div>
    </div>
  );
}
