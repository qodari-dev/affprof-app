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
    'amazon|audio|creator-gear',
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
    'amazon|books',
  ],
  [
    'Notion',
    'https://affiliate.notion.so/abc123',
    'notion-affiliate',
    'notion',
    '',
    '',
    '',
    '',
    '',
    '',
    'true',
    '',
    'tools|productivity',
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
      const response = await importLinks({ body: { rows } });
      const b = response.body;
      return {
        createdCount: b.createdCount,
        updatedCount: b.updatedCount,
        skippedCount: b.skippedCount,
        createdProductsCount: b.createdProductsCount,
        createdTagsCount: b.createdTagsCount,
        errors: b.errors,
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
