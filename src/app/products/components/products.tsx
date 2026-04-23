'use client';

import * as React from 'react';
import type { TableMeta } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import { useBilling } from '@/hooks/queries/use-billing-queries';
import type { Products as ProductType } from '@/server/db';
import type { ProductSortField, ProductInclude } from '@/schemas/product';

import { useProductColumns } from './product-columns';
import { ProductToolbar } from './product-toolbar';
import { ProductForm } from './product-form';
import { ProductInfo } from './product-info';

export function Products() {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const productColumns = useProductColumns();
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
  const { data: billingData } = useBilling();

  // ---- Plan limits ----
  const subscription = billingData?.status === 200 ? billingData.body : null;
  const isPro = subscription ? subscription.plan !== 'free' : false;
  const totalProducts = data?.body?.meta?.total ?? 0;
  const atProductLimit = !isPro && totalProducts >= 2;

  // ---- Mutations ----
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // ---- Sheet / dialog state ----
  const [openedInfoSheet, setOpenedInfoSheet] = React.useState(false);
  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);

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
        title={t('title')}
        description={t('description')}
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
              onRefresh={() => refetch()}
              isRefreshing={isFetching && !isLoading}
              atProductLimit={atProductLimit}
            />
          }
        />
      </PageContent>

      {/* Info sheet */}
      <ProductInfo product={product} opened={openedInfoSheet} onOpened={setOpenedInfoSheet} />

      {/* Form sheet (create / edit) */}
      <ProductForm product={product} opened={openedFormSheet} onOpened={setOpenedFormSheet} />

      {/* Delete confirmation */}
      <AlertDialog open={openedDeleteDialog} onOpenChange={setOpenedDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm', { name: product?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpenedDeleteDialog(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tc('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
