'use client';

import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useLocale as useSetLocale } from '@/hooks/use-locale';
import { useUpdateProfile } from '@/hooks/queries/use-profile-queries';

export function LanguageToggle() {
  const locale = useLocale();
  const { setLocale, isPending: isNavigating } = useSetLocale();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  function toggle() {
    const next = locale === 'en' ? 'es' : 'en';
    updateProfile({ body: { language: next } }, {
      onSuccess: () => setLocale(next),
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      disabled={isPending || isNavigating}
      className="w-10 text-xs font-semibold"
      aria-label="Switch language"
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </Button>
  );
}
