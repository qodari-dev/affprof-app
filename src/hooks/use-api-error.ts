'use client';

import { useTranslations } from 'next-intl';
import { getTsRestError } from '@/utils/get-ts-rest-error-message';
import { translateError } from '@/utils/translate-error';

export function useApiError() {
  const t = useTranslations('errors');
  return (error: unknown) => translateError(t, getTsRestError(error));
}
