import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale, LOCALE_COOKIE } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'never', // No /en/ or /es/ in URLs — cookie-based only
  localeCookie: {
    name: LOCALE_COOKIE,
  },
});
