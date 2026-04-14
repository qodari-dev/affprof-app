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

import { useTags, useDeleteTag } from '@/hooks/queries/use-tag-queries';
import type { Tags as TagType } from '@/server/db';
import type { TagSortField, TagInclude } from '@/schemas/tag';

import { useTagColumns } from './tag-columns';
import { TagToolbar } from './tag-toolbar';
import { TagForm } from './tag-form';
import { TagInfo } from './tag-info';

export function Tags() {
  const t = useTranslations('tags');
  const tc = useTranslations('common');
  const tagColumns = useTagColumns();
  const [tag, setTag] = React.useState<TagType>();

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
  } = useDataTable<TagSortField, TagInclude>({
    defaultPageSize: 20,
    defaultIncludes: ['linkTags'],
    defaultSorting: [{ field: 'createdAt', order: 'desc' }],
  });

  // ---- Fetch data ----
  const { data, isLoading, isFetching, refetch } = useTags(queryParams);

  // ---- Mutations ----
  const { mutateAsync: deleteTag, isPending: isDeleting } = useDeleteTag();

  // ---- Sheet / dialog state ----
  const [openedInfoSheet, setOpenedInfoSheet] = React.useState(false);
  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);

  // ---- Handlers ----
  const handleCreate = React.useCallback(() => {
    setTag(undefined);
    setOpenedFormSheet(true);
  }, []);

  const handleRowView = React.useCallback((row: TagType) => {
    setTag(row);
    setOpenedInfoSheet(true);
  }, []);

  const handleRowEdit = React.useCallback((row: TagType) => {
    setTag(row);
    setOpenedFormSheet(true);
  }, []);

  const handleRowDelete = React.useCallback((row: TagType) => {
    setTag(row);
    setOpenedDeleteDialog(true);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!tag) return;
    try {
      await deleteTag({ params: { id: tag.id } });
      setOpenedDeleteDialog(false);
    } catch {
      // Error handled by mutation onError
    }
  }, [tag, deleteTag]);

  // ---- Table meta ----
  const tableMeta = React.useMemo<TableMeta<TagType>>(
    () => ({
      onRowView: handleRowView,
      onRowEdit: handleRowEdit,
      onRowDelete: handleRowDelete,
    }),
    [handleRowView, handleRowEdit, handleRowDelete],
  );

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <PageContent>
        <DataTable
          columns={tagColumns}
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
            <TagToolbar
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              onCreate={handleCreate}
              onRefresh={() => refetch()}
              isRefreshing={isFetching && !isLoading}
            />
          }
        />
      </PageContent>

      {/* Info sheet */}
      <TagInfo tag={tag} opened={openedInfoSheet} onOpened={setOpenedInfoSheet} />

      {/* Form sheet (create / edit) */}
      <TagForm tag={tag} opened={openedFormSheet} onOpened={setOpenedFormSheet} />

      {/* Delete confirmation */}
      <AlertDialog open={openedDeleteDialog} onOpenChange={setOpenedDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm', { name: tag?.name ?? '' })}
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
