'use client';

import { FileUp, Plus, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  isRefreshing?: boolean;
  atProductLimit?: boolean;
}

export function ProductToolbar({
  searchValue,
  onSearchChange,
  onRefresh,
  onCreate,
  onImport,
  isRefreshing,
  atProductLimit,
}: ProductToolbarProps) {
  const t = useTranslations('products');
  const tc = useTranslations('common');

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-2 lg:flex-row lg:items-center">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="md:max-w-xs"
        />
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
            <FileUp />
            {tc('importCsv')}
          </Button>
        )}

        {onCreate && (
          atProductLimit ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Button disabled>
                    <Plus />
                    {t('newProduct')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('limitReached')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button onClick={onCreate}>
              <Plus />
              {t('newProduct')}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
