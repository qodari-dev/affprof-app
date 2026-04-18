'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ListProductsQuery } from '@/schemas/product';

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Partial<ListProductsQuery> = {}) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

export function useProducts(filters: Partial<ListProductsQuery> = {}) {
  return api.product.list.useQuery({
    queryKey: productsKeys.list(filters),
    queryData: { query: filters as ListProductsQuery },
  });
}

export function useProduct(id: string, options?: { enabled?: boolean }) {
  return api.product.getById.useQuery({
    queryKey: productsKeys.detail(id),
    queryData: { params: { id }, query: {} },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateProduct() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.product.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('productCreated'));
    },
    onError(error) {
      toast.error(t('productCreateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.product.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(variables.params.id) });
      toast.success(t('productUpdated'));
    },
    onError(error) {
      toast.error(t('productUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

export function usePresignProductImageUpload() {
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.product.presignImageUpload.useMutation({
    onError(error) {
      toast.error(t('productImageUploadError'), { description: getErrorMessage(error) });
    },
  });
}

export function useImportProductsCsv() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.product.importCsv.useMutation({
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      const { importedCount, skippedCount } = data.body;
      toast.success(t('productsImported', { count: importedCount }), {
        description: skippedCount > 0
          ? t('productsImportSkipped', { count: skippedCount })
          : undefined,
      });
    },
    onError(error) {
      toast.error(t('productsImportError'), { description: getErrorMessage(error) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.product.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({ queryKey: productsKeys.detail(variables.params.id) });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('productDeleted'));
    },
    onError(error) {
      toast.error(t('productDeleteError'), { description: getErrorMessage(error) });
    },
  });
}
