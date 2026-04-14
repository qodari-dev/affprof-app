'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALE_COOKIE, type Locale } from '@/i18n/config';

/**
 * Hook to switch the app locale.
 * Sets the cookie and refreshes the page to pick up the new locale.
 */
export function useLocale() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    // Set cookie (1 year)
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;

    // Refresh to pick up the new locale server-side
    startTransition(() => {
      router.refresh();
    });
  }

  return { setLocale, isPending };
}
