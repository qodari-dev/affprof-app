'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { CsvImportDialog } from '@/components/csv-import-dialog';
import { useImportLinksCsv } from '@/hooks/queries/use-link-queries';
import {
  LINK_IMPORT_COLUMNS,
  normalizeLinkImportRows,
  type NormalizedLinkImportRow,
} from '@/utils/bulk-import';

const LINK_TEMPLATE_ROWS = [
  [
    'Blue Yeti Microphone',
    'https://www.amazon.com/dp/B002VA464S',
    'blue-yeti-amazon',
    'amazon',
    'https://yourbrand.com/audio-deals',
    'instagram',
    'bio',
    'spring-launch',
    'hero-button',
    'creator-tools',
    'true',
    'Top link for Instagram bio',
  ],
  [
    'Kindle Paperwhite',
    'https://www.amazon.com/dp/B0CFPHTMDX',
    'kindle-paperwhite-amazon',
    'amazon',
    '',
    'youtube',
    'description',
    'book-favorites',
    'video-cta',
    '',
    'yes',
    'Linked from long-form review',
  ],
];

export function LinkImportDialog({
  opened,
  onOpened,
}: {
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const t = useTranslations('links.import');
  const { mutateAsync: importLinks, isPending } = useImportLinksCsv();

  const handleImport = React.useCallback(
    async (rows: NormalizedLinkImportRow[]) => {
      const response = await importLinks({
        body: {
          rows,
        },
      });

      return {
        importedCount: response.body.importedCount,
        skippedCount: response.body.skippedCount,
        errors: response.body.errors,
        extraSummary:
          response.body.createdProductsCount > 0
            ? `${response.body.createdProductsCount} product${response.body.createdProductsCount === 1 ? '' : 's'} created automatically.`
            : undefined,
      };
    },
    [importLinks],
  );

  return (
    <CsvImportDialog
      title={t('title')}
      description={t('description')}
      opened={opened}
      onOpened={onOpened}
      columns={LINK_IMPORT_COLUMNS.map((column) => ({ ...column }))}
      templateHeaders={LINK_IMPORT_COLUMNS.map((column) => column.name)}
      templateRows={LINK_TEMPLATE_ROWS}
      previewColumns={[
        { key: 'row', label: t('row') },
        { key: 'productName', label: t('product') },
        { key: 'slug', label: t('slug') },
        { key: 'platform', label: t('platform') },
        { key: 'baseUrl', label: t('baseUrl') },
      ]}
      normalizeRows={normalizeLinkImportRows}
      onImport={handleImport}
      importing={isPending}
      importLabel={t('importButton')}
      templateFileName={t('templateFile')}
    />
  );
}
