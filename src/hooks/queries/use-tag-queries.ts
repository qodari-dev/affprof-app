'use client';

import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';
import type { ListTagsQuery } from '@/schemas/tag';

// ============================================================================
// Query Keys
// ============================================================================

export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (filters: Partial<ListTagsQuery> = {}) => [...tagsKeys.lists(), filters] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
};

// ============================================================================
// LIST
// ============================================================================

export function useTags(filters: Partial<ListTagsQuery> = {}) {
  return api.tag.list.useQuery({
    queryKey: tagsKeys.list(filters),
    queryData: { query: filters as ListTagsQuery },
  });
}

// ============================================================================
// GET BY ID
// ============================================================================

export function useTag(id: string, options?: { enabled?: boolean }) {
  return api.tag.getById.useQuery({
    queryKey: tagsKeys.detail(id),
    queryData: { params: { id }, query: {} },
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ============================================================================
// CREATE
// ============================================================================

export function useCreateTag() {
  const queryClient = api.useQueryClient();

  return api.tag.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag created successfully');
    },
    onError(error) {
      toast.error('Error creating tag', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// UPDATE
// ============================================================================

export function useUpdateTag() {
  const queryClient = api.useQueryClient();

  return api.tag.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tagsKeys.detail(variables.params.id),
      });
      toast.success('Tag updated successfully');
    },
    onError(error) {
      toast.error('Error updating tag', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// DELETE
// ============================================================================

export function useDeleteTag() {
  const queryClient = api.useQueryClient();

  return api.tag.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({
        queryKey: tagsKeys.detail(variables.params.id),
      });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag deleted successfully');
    },
    onError(error) {
      toast.error('Error deleting tag', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
