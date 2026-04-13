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

import { useProducts, useDeleteProduct } from '@/hooks/queries/use-product-queries';
import type { Products as ProductType } from '@/server/db';
import type { ProductSortField, ProductInclude } from '@/schemas/product';

import { productColumns } from './product-columns';
import { ProductToolbar } from './product-toolbar';
import { ProductForm } from './product-form';
import { ProductInfo } from './product-info';
import { ProductImportDialog } from './product-import-dialog';

export function Products() {
  const [product, setProduct] = React.useState<ProductType>();

  // ---- Data table state ----
  const {
    pageIndex,
    pageSize,
    sorting,
    searchValue,
    queryParams,
    handlePaginationChange,
    handleSortingChange,
    handleSearchChange,
  } = useDataTable<ProductSortField, ProductInclude>({
    defaultPageSize: 20,
    defaultIncludes: ['links'],
    defaultSorting: [{ field: 'createdAt', order: 'desc' }],
  });

  // ---- Fetch data ----
  const { data, isLoading, isFetching, refetch } = useProducts(queryParams);

  // ---- Mutations ----
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // ---- Sheet / dialog state ----
  const [openedInfoSheet, setOpenedInfoSheet] = React.useState(false);
  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const [openedImportDialog, setOpenedImportDialog] = React.useState(false);

  // ---- Handlers ----
  const handleCreate = React.useCallback(() => {
    setProduct(undefined);
    setOpenedFormSheet(true);
  }, []);

  const handleRowView = React.useCallback((row: ProductType) => {
    setProduct(row);
    setOpenedInfoSheet(true);
  }, []);

  const handleRowEdit = React.useCallback((row: ProductType) => {
    setProduct(row);
    setOpenedFormSheet(true);
  }, []);

  const handleRowDelete = React.useCallback((row: ProductType) => {
    setProduct(row);
    setOpenedDeleteDialog(true);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!product) return;
    try {
      await deleteProduct({ params: { id: product.id } });
      setOpenedDeleteDialog(false);
    } catch {
      // Error handled by mutation onError
    }
  }, [product, deleteProduct]);

  // ---- Table meta ----
  const tableMeta = React.useMemo<TableMeta<ProductType>>(
    () => ({
      onRowView: handleRowView,
      onRowEdit: handleRowEdit,
      onRowDelete: handleRowDelete,
    }),
    [handleRowView, handleRowEdit, handleRowDelete],
  );

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage the products you promote with affiliate links."
      />
      <PageContent>
        <DataTable
          columns={productColumns}
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
            <ProductToolbar
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              onCreate={handleCreate}
              onImport={() => setOpenedImportDialog(true)}
              onRefresh={() => refetch()}
              isRefreshing={isFetching && !isLoading}
            />
          }
        />
      </PageContent>

      {/* Info sheet */}
      <ProductInfo product={product} opened={openedInfoSheet} onOpened={setOpenedInfoSheet} />

      {/* Form sheet (create / edit) */}
      <ProductForm product={product} opened={openedFormSheet} onOpened={setOpenedFormSheet} />

      <ProductImportDialog opened={openedImportDialog} onOpened={setOpenedImportDialog} />

      {/* Delete confirmation */}
      <AlertDialog open={openedDeleteDialog} onOpenChange={setOpenedDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &ldquo;{product?.name}&rdquo; and all its
              associated links. This action cannot be undone.
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
