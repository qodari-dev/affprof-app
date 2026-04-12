'use client';

import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';

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

  return api.brand.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand created');
    },
    onError: (error) => {
      toast.error('Error creating brand', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = api.useQueryClient();

  return api.brand.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand updated');
    },
    onError: (error) => {
      toast.error('Error updating brand', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useSetDefaultBrand() {
  const queryClient = api.useQueryClient();

  return api.brand.setDefault.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Default brand updated');
    },
    onError: (error) => {
      toast.error('Error updating default brand', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = api.useQueryClient();

  return api.brand.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand deleted');
    },
    onError: (error) => {
      toast.error('Error deleting brand', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function usePresignBrandLogoUpload() {
  return api.brand.presignLogoUpload.useMutation({
    onError: (error) => {
      toast.error('Error preparing brand logo upload', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function getDefaultBrandId(
  brands: Array<{ id: string; isDefault: boolean }> | undefined,
) {
  return brands?.find((brand) => brand.isDefault)?.id ?? brands?.[0]?.id ?? null;
}
