'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const brandKeys = {
  all: ['brands'] as const,
  list: () => [...brandKeys.all, 'list'] as const,
};

export function useBrands(options?: { enabled?: boolean }) {
  return api.brand.list.useQuery({
    queryKey: brandKeys.list(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useCreateBrand() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.brand.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success(t('brandCreated'));
    },
    onError: (error) => {
      toast.error(t('brandCreateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.brand.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success(t('brandUpdated'));
    },
    onError: (error) => {
      toast.error(t('brandUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useSetDefaultBrand() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.brand.setDefault.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success(t('brandDefaultUpdated'));
    },
    onError: (error) => {
      toast.error(t('brandDefaultUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.brand.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success(t('brandDeleted'));
    },
    onError: (error) => {
      toast.error(t('brandDeleteError'), { description: getErrorMessage(error) });
    },
  });
}

export function usePresignBrandLogoUpload() {
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.brand.presignLogoUpload.useMutation({
    onError: (error) => {
      toast.error(t('brandLogoUploadError'), { description: getErrorMessage(error) });
    },
  });
}

export function getDefaultBrandId(
  brands: Array<{ id: string; isDefault: boolean }> | undefined,
) {
  return brands?.find((brand) => brand.isDefault)?.id ?? brands?.[0]?.id ?? null;
}
