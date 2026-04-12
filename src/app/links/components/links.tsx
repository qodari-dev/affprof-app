'use client';

import * as React from 'react';
import type { TableMeta } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import { PageHeader, PageContent } from '@/components/layout';
import { DataTable, useDataTable } from '@/components/data-table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { useLinks, useDeleteLink } from '@/hooks/queries/use-link-queries';
import { useProducts } from '@/hooks/queries/use-product-queries';
import { useProfile } from '@/hooks/queries/use-profile-queries';
import { useTags } from '@/hooks/queries/use-tag-queries';
import {
  getPrimaryVerifiedCustomDomainHostname,
  useCustomDomains,
} from '@/hooks/queries/use-custom-domain-queries';
import type { Links as LinkType } from '@/server/db';
import type { LinkSortField, LinkInclude } from '@/schemas/link';
import { buildShortLinkUrl } from '@/utils/short-link';

import { linkColumns } from './link-columns';
import { LinkToolbar } from './link-toolbar';
import { LinkForm } from './link-form';
import { LinkInfo } from './link-info';
import { LinkQrDialog } from './link-qr-dialog';

export function Links() {
  const [link, setLink] = React.useState<LinkType>();

  // ---- Profile (for short URL) ----
  const { data: profileData } = useProfile();
  const { data: customDomainsData } = useCustomDomains();
  const userSlug = profileData?.status === 200 ? profileData.body.slug : '';
  const primaryCustomDomain = customDomainsData?.status === 200
    ? getPrimaryVerifiedCustomDomainHostname(customDomainsData.body)
    : null;

  // ---- Data table state ----
  const {
    pageIndex,
    pageSize,
    sorting,
    searchValue,
    filters,
    queryParams,
    handlePaginationChange,
    handleSortingChange,
    handleSearchChange,
    handleFilterChange,
    resetFilters,
  } = useDataTable<LinkSortField, LinkInclude>({
    defaultPageSize: 20,
    defaultIncludes: ['product', 'brand', 'linkTags'],
    defaultSorting: [{ field: 'createdAt', order: 'desc' }],
  });

  // ---- Fetch data ----
  const { data, isLoading, isFetching, refetch } = useLinks(queryParams);
  const { data: productsData } = useProducts({
    page: 1,
    limit: 100,
    sort: [{ field: 'name', order: 'asc' }],
  });
  const { data: tagsData } = useTags({
    page: 1,
    limit: 100,
    sort: [{ field: 'name', order: 'asc' }],
  });

  // ---- Mutations ----
  const { mutateAsync: deleteLink, isPending: isDeleting } = useDeleteLink();

  // ---- Sheet / dialog state ----
  const [openedInfoSheet, setOpenedInfoSheet] = React.useState(false);
  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const [openedQrDialog, setOpenedQrDialog] = React.useState(false);

  // ---- Handlers ----
  const handleCreate = React.useCallback(() => {
    setLink(undefined);
    setOpenedFormSheet(true);
  }, [setOpenedFormSheet]);

  const handleRowView = React.useCallback((row: LinkType) => {
    setLink(row);
    setOpenedInfoSheet(true);
  }, [setOpenedInfoSheet]);

  const handleRowEdit = React.useCallback((row: LinkType) => {
    setLink(row);
    setOpenedFormSheet(true);
  }, [setOpenedFormSheet]);

  const handleRowDelete = React.useCallback((row: LinkType) => {
    setLink(row);
    setOpenedDeleteDialog(true);
  }, [setOpenedDeleteDialog]);

  const handleRowQr = React.useCallback((row: LinkType) => {
    setLink(row);
    setOpenedQrDialog(true);
  }, [setOpenedQrDialog]);

  const handleDelete = React.useCallback(async () => {
    if (!link) return;
    try {
      await deleteLink({ params: { id: link.id } });
      setOpenedDeleteDialog(false);
    } catch {
      // Error handled by mutation onError
    }
  }, [deleteLink, link, setOpenedDeleteDialog]);

  const productFilter = typeof filters.productId === 'string' ? filters.productId : undefined;
  const tagFilter = typeof filters.tagId === 'string' ? filters.tagId : undefined;
  const statusFilter = React.useMemo(() => {
    if (filters.isEnabled === false) return 'disabled';
    return typeof filters.status === 'string' ? filters.status : undefined;
  }, [filters.isEnabled, filters.status]);

  const productOptions = React.useMemo(
    () =>
      (productsData?.body?.data ?? []).map((product) => ({
        label: product.name,
        value: product.id,
      })),
    [productsData?.body?.data],
  );

  const tagOptions = React.useMemo(
    () =>
      (tagsData?.body?.data ?? []).map((tag) => ({
        label: tag.name,
        value: tag.id,
        color: tag.color,
      })),
    [tagsData?.body?.data],
  );

  const statusOptions = React.useMemo(
    () => [
      { label: 'Active', value: 'active', color: '#16a34a' },
      { label: 'Broken', value: 'broken', color: '#dc2626' },
      { label: 'Unknown', value: 'unknown', color: '#6b7280' },
      { label: 'Disabled', value: 'disabled', color: '#d97706' },
    ],
    [],
  );

  const handleStatusFilterChange = React.useCallback((value: string | undefined) => {
    if (!value) {
      handleFilterChange('status', undefined);
      handleFilterChange('isEnabled', undefined);
      return;
    }

    if (value === 'disabled') {
      handleFilterChange('status', undefined);
      handleFilterChange('isEnabled', false);
      return;
    }

    handleFilterChange('isEnabled', undefined);
    handleFilterChange('status', value);
  }, [handleFilterChange]);

  // ---- Short URL builder ----
  const shortUrl = link && userSlug
    ? buildShortLinkUrl(userSlug, link.slug, primaryCustomDomain)
    : '';

  // ---- Table meta ----
  const tableMeta = React.useMemo<TableMeta<LinkType>>(
    () => ({
      onRowView: handleRowView,
      onRowEdit: handleRowEdit,
      onRowDelete: handleRowDelete,
      onRowQr: handleRowQr,
    }),
    [handleRowView, handleRowEdit, handleRowDelete, handleRowQr],
  );

  return (
    <>
      <PageHeader
        title="Links"
        description="Manage your affiliate links, track clicks, and monitor status."
      />
      <PageContent>
        <DataTable
          columns={linkColumns}
          data={data?.body?.data ?? []}
          pageCount={data?.body?.meta?.totalPages ?? 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={data?.body?.meta?.total}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          meta={tableMeta}
          toolbar={
            <LinkToolbar
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              productFilter={productFilter}
              productOptions={productOptions}
              onProductFilterChange={(value) => handleFilterChange('productId', value)}
              statusFilter={statusFilter}
              statusOptions={statusOptions}
              onStatusFilterChange={handleStatusFilterChange}
              tagFilter={tagFilter}
              tagOptions={tagOptions}
              onTagFilterChange={(value) => handleFilterChange('tagId', value)}
              onReset={resetFilters}
              onCreate={handleCreate}
              onRefresh={() => refetch()}
              isRefreshing={isFetching && !isLoading}
            />
          }
        />
      </PageContent>

      {/* Info sheet */}
      <LinkInfo link={link} opened={openedInfoSheet} onOpened={setOpenedInfoSheet} />

      {/* Form sheet (create / edit) */}
      <LinkForm link={link} opened={openedFormSheet} onOpened={setOpenedFormSheet} />

      {/* QR Code dialog */}
      <LinkQrDialog
        shortUrl={shortUrl}
        slug={link?.slug ?? ''}
        initialBrandId={link?.brandId ?? null}
        opened={openedQrDialog}
        onOpened={setOpenedQrDialog}
      />

      {/* Delete confirmation */}
      <AlertDialog open={openedDeleteDialog} onOpenChange={setOpenedDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the link &ldquo;/{link?.slug}&rdquo; and all its
              click data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpenedDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
