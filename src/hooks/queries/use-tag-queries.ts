'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ListTagsQuery } from '@/schemas/tag';

export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (filters: Partial<ListTagsQuery> = {}) => [...tagsKeys.lists(), filters] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
};

export function useTags(filters: Partial<ListTagsQuery> = {}) {
  return api.tag.list.useQuery({
    queryKey: tagsKeys.list(filters),
    queryData: { query: filters as ListTagsQuery },
  });
}

export function useTag(id: string, options?: { enabled?: boolean }) {
  return api.tag.getById.useQuery({
    queryKey: tagsKeys.detail(id),
    queryData: { params: { id }, query: {} },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateTag() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.tag.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success(t('tagCreated'));
    },
    onError(error) {
      toast.error(t('tagCreateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useUpdateTag() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.tag.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagsKeys.detail(variables.params.id) });
      toast.success(t('tagUpdated'));
    },
    onError(error) {
      toast.error(t('tagUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useDeleteTag() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.tag.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({ queryKey: tagsKeys.detail(variables.params.id) });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success(t('tagDeleted'));
    },
    onError(error) {
      toast.error(t('tagDeleteError'), { description: getErrorMessage(error) });
    },
  });
}
