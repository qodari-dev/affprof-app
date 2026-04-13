'use client';

import * as React from 'react';

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
      title="Import products from CSV"
      description="Use a simple CSV with product names and optional descriptions. Existing names are skipped to avoid duplicates."
      opened={opened}
      onOpened={onOpened}
      columns={PRODUCT_IMPORT_COLUMNS.map((column) => ({ ...column }))}
      templateHeaders={PRODUCT_IMPORT_COLUMNS.map((column) => column.name)}
      templateRows={PRODUCT_TEMPLATE_ROWS}
      previewColumns={[
        { key: 'row', label: 'Row' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
      ]}
      normalizeRows={normalizeProductImportRows}
      onImport={handleImport}
      importing={isPending}
      importLabel="Import products"
      templateFileName="affprof-products-template.csv"
    />
  );
}
