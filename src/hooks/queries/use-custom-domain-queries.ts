'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const customDomainKeys = {
  all: ['custom-domains'] as const,
  list: () => [...customDomainKeys.all, 'list'] as const,
};

export function useCustomDomains(options?: { enabled?: boolean }) {
  return api.customDomain.list.useQuery({
    queryKey: customDomainKeys.list(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCustomDomain() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.customDomain.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error(t('customDomainAddError'), { description: getErrorMessage(error) });
    },
  });
}

export function useVerifyCustomDomain() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.customDomain.verify.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error(t('customDomainVerifyError'), { description: getErrorMessage(error) });
    },
  });
}

export function useSetPrimaryCustomDomain() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.customDomain.setPrimary.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error(t('customDomainPrimaryError'), { description: getErrorMessage(error) });
    },
  });
}

export function useDeleteCustomDomain() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.customDomain.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error(t('customDomainDeleteError'), { description: getErrorMessage(error) });
    },
  });
}

export function getPrimaryVerifiedCustomDomainHostname(
  domains:
    | Array<{ hostname: string; isPrimary: boolean; status: 'pending' | 'verified' }>
    | undefined,
) {
  return domains?.find((domain) => domain.status === 'verified' && domain.isPrimary)?.hostname ?? null;
}
