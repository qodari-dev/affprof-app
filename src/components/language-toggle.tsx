'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocale as useSetLocale } from '@/hooks/use-locale';
import { useUpdateProfile } from '@/hooks/queries/use-profile-queries';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
};

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations('common');
  const { setLocale, isPending: isNavigating } = useSetLocale();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const next = locale === 'en' ? 'es' : 'en';
  const nextLabel = LANGUAGE_LABELS[next];

  function toggle() {
    updateProfile({ body: { language: next } }, {
      onSuccess: () => setLocale(next),
    });
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={toggle}
              disabled={isPending || isNavigating}
              className="text-xs font-semibold"
            >
              {nextLabel}
            </Button>
          }
        />
        <TooltipContent side="bottom">
          {t('switchLanguageTo', { language: nextLabel })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
