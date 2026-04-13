'use client';

import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';
import type { ListLinksQuery } from '@/schemas/link';

// ============================================================================
// Query Keys
// ============================================================================

export const linksKeys = {
  all: ['links'] as const,
  lists: () => [...linksKeys.all, 'list'] as const,
  list: (filters: Partial<ListLinksQuery> = {}) => [...linksKeys.lists(), filters] as const,
  details: () => [...linksKeys.all, 'detail'] as const,
  detail: (id: string) => [...linksKeys.details(), id] as const,
};

// ============================================================================
// LIST
// ============================================================================

export function useLinks(filters: Partial<ListLinksQuery> = {}) {
  return api.link.list.useQuery({
    queryKey: linksKeys.list(filters),
    queryData: { query: filters as ListLinksQuery },
  });
}

// ============================================================================
// GET BY ID
// ============================================================================

export function useLink(id: string, options?: { enabled?: boolean }) {
  return api.link.getById.useQuery({
    queryKey: linksKeys.detail(id),
    queryData: { params: { id }, query: {} },
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ============================================================================
// CREATE
// ============================================================================

export function useCreateLink() {
  const queryClient = api.useQueryClient();

  return api.link.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      toast.success('Link created successfully');
    },
    onError(error) {
      toast.error('Error creating link', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// UPDATE
// ============================================================================

export function useUpdateLink() {
  const queryClient = api.useQueryClient();

  return api.link.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: linksKeys.detail(variables.params.id),
      });
      toast.success('Link updated successfully');
    },
    onError(error) {
      toast.error('Error updating link', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useImportLinksCsv() {
  const queryClient = api.useQueryClient();

  return api.link.importCsv.useMutation({
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      const { importedCount, skippedCount, createdProductsCount } = data.body;
      const productNote = createdProductsCount > 0
        ? ` ${createdProductsCount} product${createdProductsCount === 1 ? '' : 's'} created automatically.`
        : '';

      toast.success(`Imported ${importedCount} link${importedCount === 1 ? '' : 's'}`, {
        description: `${skippedCount} row${skippedCount === 1 ? '' : 's'} skipped.${productNote}`.trim(),
      });
    },
    onError(error) {
      toast.error('Error importing links', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// DELETE
// ============================================================================

export function useDeleteLink() {
  const queryClient = api.useQueryClient();

  return api.link.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({
        queryKey: linksKeys.detail(variables.params.id),
      });
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      toast.success('Link deleted successfully');
    },
    onError(error) {
      toast.error('Error deleting link', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// CHECK (single link)
// ============================================================================

export function useCheckLink() {
  const queryClient = api.useQueryClient();

  return api.link.check.useMutation({
    onSuccess(data, variables) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: linksKeys.detail(variables.params.id),
      });
      const result = data.body;
      if (result.isBroken) {
        toast.warning('Link is broken', {
          description: result.error ?? `Status ${result.statusCode}`,
        });
      } else {
        toast.success('Link is healthy', {
          description: `Status ${result.statusCode} — ${result.responseMs}ms`,
        });
      }
    },
    onError(error) {
      toast.error('Error checking link', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

// ============================================================================
// CHECK BULK (multiple links)
// ============================================================================

export function useCheckLinks() {
  const queryClient = api.useQueryClient();

  return api.link.checkBulk.useMutation({
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      const results = data.body;
      const broken = results.filter((r) => r.isBroken).length;
      const healthy = results.length - broken;
      if (broken > 0) {
        toast.warning(`Checked ${results.length} links`, {
          description: `${healthy} healthy, ${broken} broken`,
        });
      } else {
        toast.success(`All ${results.length} links are healthy`);
      }
    },
    onError(error) {
      toast.error('Error checking links', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
