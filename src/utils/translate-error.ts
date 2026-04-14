import type { TsRestApiError } from './get-ts-rest-error-message';

type TranslateFunction = (key: string, params?: Record<string, unknown>) => string;

/**
 * Translate an API error code to the user's language.
 *
 * Usage:
 *   const t = useTranslations('errors');
 *   toast.error(translateError(t, getTsRestError(error)));
 *
 * Falls back to the English message if no translation exists.
 */
export function translateError(t: TranslateFunction, error: TsRestApiError): string {
  try {
    const translated = t(error.code, error.params);
    // next-intl throws if key is missing (with default onError), so if we get here it's valid
    return translated;
  } catch {
    // No translation for this code — fall back to the raw English message from the API
    return error.message;
  }
}
