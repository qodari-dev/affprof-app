'use client';

import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';
import type { ListProductsQuery } from '@/schemas/product';

// ============================================================================
// Query Keys
// ============================================================================

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Partial<ListProductsQuery> = {}) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

// ============================================================================
// LIST
// ============================================================================

export function useProducts(filters: Partial<ListProductsQuery> = {}) {
  return api.product.list.useQuery({
    queryKey: productsKeys.list(filters),
    queryData: { query: filters as ListProductsQuery },
  });
}

// ============================================================================
// GET BY ID
// ============================================================================

export function useProduct(id: string, options?: { enabled?: boolean }) {
  return api.product.getById.useQuery({
    queryKey: productsKeys.detail(id),
    queryData: { params: { id }, query: {} },
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ============================================================================
// CREATE
// ============================================================================

export function useCreateProduct() {
  const queryClient = api.useQueryClient();

  return api.product.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success('Product created successfully');
    },
    onError(error) {
      toast.error('Error creating product', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// UPDATE
// ============================================================================

export function useUpdateProduct() {
  const queryClient = api.useQueryClient();

  return api.product.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(variables.params.id),
      });
      toast.success('Product updated successfully');
    },
    onError(error) {
      toast.error('Error updating product', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function usePresignProductImageUpload() {
  return api.product.presignImageUpload.useMutation({
    onError(error) {
      toast.error('Error preparing image upload', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// DELETE
// ============================================================================

export function useDeleteProduct() {
  const queryClient = api.useQueryClient();

  return api.product.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({
        queryKey: productsKeys.detail(variables.params.id),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success('Product deleted successfully');
    },
    onError(error) {
      toast.error('Error deleting product', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
