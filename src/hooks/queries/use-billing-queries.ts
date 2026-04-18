'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const billingKeys = {
  all: ['billing'] as const,
  detail: () => [...billingKeys.all, 'detail'] as const,
  history: () => [...billingKeys.all, 'history'] as const,
};

export function useBilling(options?: { enabled?: boolean }) {
  return api.billing.get.useQuery({
    queryKey: billingKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useBillingHistory(options?: { enabled?: boolean }) {
  return api.billing.history.useQuery({
    queryKey: billingKeys.history(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCheckout() {
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.billing.createCheckout.useMutation({
    onError: (error) => {
      toast.error(t('checkoutError'), { description: getErrorMessage(error) });
    },
  });
}

export function useCreatePortal() {
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.billing.createPortal.useMutation({
    onError: (error) => {
      toast.error(t('portalError'), { description: getErrorMessage(error) });
    },
  });
}
