'use client';

import * as React from 'react';
import { Check, PlusCircle, RefreshCw, X } from 'lucide-react';
import { ClickTypeInfo } from '@/components/click-type-info';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { ClickType, DashboardRange } from '@/schemas/analytics';

const RANGE_KEYS = ['7d', '30d', '90d', '180d', '360d'] as const;
const CLICK_TYPE_KEYS: ClickType[] = ['all', 'successful', 'failed'];

interface ProductOption {
  label: string;
  value: string;
}

interface DashboardToolbarProps {
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  clickType: ClickType;
  onClickTypeChange: (clickType: ClickType) => void;
  productId?: string;
  productOptions: ProductOption[];
  onProductChange: (id: string | undefined) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardToolbar({
  range,
  onRangeChange,
  clickType,
  onClickTypeChange,
  productId,
  productOptions,
  onProductChange,
  onRefresh,
  isRefreshing,
}: DashboardToolbarProps) {
  const t = useTranslations('dashboard.toolbar');
  const tr = useTranslations('dashboard.ranges');
  const tc = useTranslations('common');

  const selectedProduct = React.useMemo(
    () => productOptions.find((o) => o.value === productId),
    [productOptions, productId],
  );

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="h-10 border-dashed px-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('product')}
                {selectedProduct && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Badge
                      variant="secondary"
                      className="max-w-[160px] truncate rounded-sm px-1 font-normal"
                    >
                      {selectedProduct.label}
                    </Badge>
                  </>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t('searchProduct')} />
              <CommandList>
                <CommandEmpty>{t('noProducts')}</CommandEmpty>
                <CommandGroup>
                  {productOptions.map((option) => {
                    const isSelected = productId === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() =>
                          onProductChange(isSelected ? undefined : option.value)
                        }
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50',
                          )}
                        >
                          <Check
                            className={cn('h-3 w-3', !isSelected && 'invisible')}
                          />
                        </div>
                        <span className="truncate">{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {productId && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => onProductChange(undefined)}
                        className="justify-center"
                      >
                        {t('clearFilter')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {productId && (
          <Button
            variant="ghost"
            onClick={() => onProductChange(undefined)}
            className="h-10 px-3"
          >
            {t('clear')}
            <X className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border bg-background p-0.5">
            {CLICK_TYPE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onClickTypeChange(key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                  clickType === key
                    ? key === 'successful'
                      ? 'bg-emerald-500 text-white'
                      : key === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`clickType.${key}`)}
              </button>
            ))}
          </div>
          <ClickTypeInfo />
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center rounded-md border bg-background p-0.5">
          {RANGE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onRangeChange(key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                range === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tr(key)}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          <span className="sr-only">{tc('refresh')}</span>
        </Button>
      </div>
    </div>
  );
}
