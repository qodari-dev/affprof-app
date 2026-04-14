'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { CsvImportDialog } from '@/components/csv-import-dialog';
import { useImportProductsCsv } from '@/hooks/queries/use-product-queries';
import {
  normalizeProductImportRows,
  PRODUCT_IMPORT_COLUMNS,
  type NormalizedProductImportRow,
} from '@/utils/bulk-import';

const PRODUCT_TEMPLATE_ROWS = [
  ['Blue Yeti Microphone', 'USB microphone for creators and podcasts'],
  ['Kindle Paperwhite', 'Popular e-reader with affiliate demand'],
];

export function ProductImportDialog({
  opened,
  onOpened,
}: {
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const t = useTranslations('products.import');
  const { mutateAsync: importProducts, isPending } = useImportProductsCsv();

  const handleImport = React.useCallback(
    async (rows: NormalizedProductImportRow[]) => {
      const response = await importProducts({
        body: {
          rows,
        },
      });

      return {
        importedCount: response.body.importedCount,
        skippedCount: response.body.skippedCount,
        errors: response.body.errors,
      };
    },
    [importProducts],
  );

  return (
    <CsvImportDialog
      title={t('title')}
      description={t('description')}
      opened={opened}
      onOpened={onOpened}
      columns={PRODUCT_IMPORT_COLUMNS.map((column) => ({ ...column }))}
      templateHeaders={PRODUCT_IMPORT_COLUMNS.map((column) => column.name)}
      templateRows={PRODUCT_TEMPLATE_ROWS}
      previewColumns={[
        { key: 'row', label: t('row') },
        { key: 'name', label: t('name') },
        { key: 'description', label: t('descriptionCol') },
      ]}
      normalizeRows={normalizeProductImportRows}
      onImport={handleImport}
      importing={isPending}
      importLabel={t('importButton')}
      templateFileName={t('templateFile')}
    />
  );
}
