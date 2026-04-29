'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ListLinksQuery } from '@/schemas/link';
import { linksKeys, productsKeys, tagsKeys } from '@/hooks/queries/query-keys';

export { linksKeys };

// ============================================================================
// PLATFORMS
// ============================================================================

export function useLinkPlatforms() {
  return api.link.platforms.useQuery({
    queryKey: linksKeys.platforms(),
    queryData: {},
  });
}

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
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.create.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linksKeys.platforms() });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success(t('linkCreated'));
    },
    onError(error) {
      toast.error(t('linkCreateError'), { description: getErrorMessage(error) });
    },
  });
}

// ============================================================================
// UPDATE
// ============================================================================

export function useUpdateLink() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.update.useMutation({
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linksKeys.detail(variables.params.id) });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success(t('linkUpdated'));
    },
    onError(error) {
      toast.error(t('linkUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export function useExportLinks() {
  const t = useTranslations('toasts');

  const query = api.link.exportCsv.useQuery({
    queryKey: [...linksKeys.all, 'export'],
    queryData: {},
    enabled: false,
  });

  async function exportLinks() {
    const result = await query.refetch();
    if (result.data?.status === 200) {
      const csv = result.data.body.csv;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'links.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.error(t('linksExportError'));
    }
  }

  return { exportLinks, isExporting: query.isFetching };
}

// ============================================================================
// IMPORT
// ============================================================================

export function useImportLinksCsv() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.importCsv.useMutation({
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linksKeys.platforms() });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      const { createdCount, updatedCount, skippedCount, createdProductsCount } = data.body;
      const productNote = createdProductsCount > 0
        ? ` ${t('linksImportProductsCreated', { count: createdProductsCount })}`
        : '';
      const importedCount = createdCount + updatedCount;
      toast.success(t('linksImported', { count: importedCount }), {
        description: skippedCount > 0
          ? `${t('linksImportSkipped', { count: skippedCount })}${productNote}`.trim()
          : productNote.trim() || undefined,
      });
    },
    onError(error) {
      toast.error(t('linksImportError'), { description: getErrorMessage(error) });
    },
  });
}

// ============================================================================
// DELETE
// ============================================================================

export function useDeleteLink() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.delete.useMutation({
    onSuccess(_data, variables) {
      queryClient.removeQueries({ queryKey: linksKeys.detail(variables.params.id) });
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linksKeys.platforms() });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success(t('linkDeleted'));
    },
    onError(error) {
      toast.error(t('linkDeleteError'), { description: getErrorMessage(error) });
    },
  });
}

// ============================================================================
// CHECK (single link)
// ============================================================================

export function useCheckLink() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.check.useMutation({
    onSuccess(data, variables) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linksKeys.detail(variables.params.id) });
      const result = data.body;
      if (result.isBroken) {
        toast.warning(t('linkCheckedBroken'), {
          description: result.error ?? `Status ${result.statusCode}`,
        });
      } else {
        toast.success(t('linkCheckedHealthy'), {
          description: `Status ${result.statusCode} — ${result.responseMs}ms`,
        });
      }
    },
    onError(error) {
      toast.error(t('linkCheckError'), { description: getErrorMessage(error) });
    },
  });
}

// ============================================================================
// CHECK BULK
// ============================================================================

export function useCheckLinks() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.link.checkBulk.useMutation({
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: linksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      const results = data.body;
      const broken = results.filter((r) => r.isBroken).length;
      const healthy = results.length - broken;
      if (broken > 0) {
        toast.warning(t('linksCheckedWithBroken', { healthy, broken }));
      } else {
        toast.success(t('linksCheckedAllHealthy', { count: results.length }));
      }
    },
    onError(error) {
      toast.error(t('linksCheckError'), { description: getErrorMessage(error) });
    },
  });
}
