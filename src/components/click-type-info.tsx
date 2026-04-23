'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ClickTypeInfo() {
  const t = useTranslations('common.clickTypeHelp');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<button type="button" className="inline-flex items-center" />}>
          <Info className="h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-foreground" />
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="flex flex-col items-start gap-2 px-3 py-2.5 max-w-[300px]"
        >
          <p className="font-semibold">{t('title')}</p>
          <ul className="space-y-1.5 font-normal">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
              <span>
                <span className="font-medium">{t('allLabel')}</span>
                {' — '}
                {t('all')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              <span>
                <span className="font-medium">{t('successfulLabel')}</span>
                {' — '}
                {t('successful')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
              <span>
                <span className="font-medium">{t('failedLabel')}</span>
                {' — '}
                {t('failed')}
              </span>
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
