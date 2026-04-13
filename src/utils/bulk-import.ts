export interface ImportPreviewError {
  row: number;
  message: string;
}

export interface NormalizedProductImportRow {
  row: number;
  name: string;
  description?: string;
}

export interface NormalizedLinkImportRow {
  row: number;
  productName: string;
  baseUrl: string;
  slug: string;
  platform: string;
  fallbackUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  isEnabled?: boolean;
  notes?: string;
}

function getValue(raw: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const matchedKey = Object.keys(raw).find((key) => key.trim().toLowerCase() === alias);
    if (matchedKey) {
      const value = raw[matchedKey]?.trim();
      if (value) return value;
    }
  }

  return '';
}

function parseBooleanLike(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (['true', 'yes', 'y', '1', 'active', 'enabled'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'disabled', 'inactive'].includes(normalized)) return false;
  return null;
}

export const PRODUCT_IMPORT_COLUMNS = [
  { name: 'name', required: true, description: 'Product name', example: 'Blue Yeti Microphone' },
  { name: 'description', required: false, description: 'Optional description', example: 'USB microphone for creators' },
] as const;

export const PRODUCT_IMPORT_TEMPLATE_HEADERS = PRODUCT_IMPORT_COLUMNS.map((column) => column.name);

export const LINK_IMPORT_COLUMNS = [
  { name: 'product', required: true, description: 'Product name. Missing products will be created automatically.', example: 'Blue Yeti Microphone' },
  { name: 'link', required: true, description: 'Destination/base URL', example: 'https://www.amazon.com/dp/B08N5...' },
  { name: 'slug', required: true, description: 'Short-link slug', example: 'blue-yeti-amazon' },
  { name: 'platform', required: true, description: 'Affiliate network or marketplace', example: 'amazon' },
  { name: 'fallback_url', required: false, description: 'Optional fallback URL', example: 'https://yourbrand.com/backup' },
  { name: 'utm_source', required: false, description: 'Optional UTM source', example: 'instagram' },
  { name: 'utm_medium', required: false, description: 'Optional UTM medium', example: 'bio' },
  { name: 'utm_campaign', required: false, description: 'Optional UTM campaign', example: 'spring-launch' },
  { name: 'utm_content', required: false, description: 'Optional UTM content', example: 'hero-button' },
  { name: 'utm_term', required: false, description: 'Optional UTM term', example: 'creator-tools' },
  { name: 'is_enabled', required: false, description: 'true/false, yes/no, 1/0', example: 'true' },
  { name: 'notes', required: false, description: 'Internal note', example: 'Best performer in Instagram bio' },
] as const;

export const LINK_IMPORT_TEMPLATE_HEADERS = LINK_IMPORT_COLUMNS.map((column) => column.name);

export function normalizeProductImportRows(rawRows: Array<Record<string, string>>) {
  const errors: ImportPreviewError[] = [];
  const rows: NormalizedProductImportRow[] = [];

  rawRows.forEach((raw, index) => {
    const row = index + 2;
    const name = getValue(raw, ['name', 'product', 'product_name']);
    const description = getValue(raw, ['description', 'desc']);

    if (!name) {
      errors.push({ row, message: 'Missing required column "name".' });
      return;
    }

    rows.push({
      row,
      name,
      description: description || undefined,
    });
  });

  return { rows, errors };
}

export function normalizeLinkImportRows(rawRows: Array<Record<string, string>>) {
  const errors: ImportPreviewError[] = [];
  const rows: NormalizedLinkImportRow[] = [];

  rawRows.forEach((raw, index) => {
    const row = index + 2;
    const productName = getValue(raw, ['product', 'product_name', 'productname']);
    const baseUrl = getValue(raw, ['link', 'base_url', 'baseurl', 'url', 'destination_url', 'original_url', 'final_url']);
    const slug = getValue(raw, ['slug']);
    const platform = getValue(raw, ['platform']);
    const fallbackUrl = getValue(raw, ['fallback_url', 'fallback']);
    const utmSource = getValue(raw, ['utm_source']);
    const utmMedium = getValue(raw, ['utm_medium']);
    const utmCampaign = getValue(raw, ['utm_campaign']);
    const utmContent = getValue(raw, ['utm_content']);
    const utmTerm = getValue(raw, ['utm_term']);
    const notes = getValue(raw, ['notes', 'note']);
    const isEnabledValue = getValue(raw, ['is_enabled', 'enabled', 'active']);

    if (!productName) {
      errors.push({ row, message: 'Missing required column "product".' });
      return;
    }

    if (!baseUrl) {
      errors.push({ row, message: 'Missing required column "link".' });
      return;
    }

    if (!slug) {
      errors.push({ row, message: 'Missing required column "slug".' });
      return;
    }

    if (!platform) {
      errors.push({ row, message: 'Missing required column "platform".' });
      return;
    }

    const isEnabled = parseBooleanLike(isEnabledValue);
    if (isEnabledValue && isEnabled === null) {
      errors.push({ row, message: 'Invalid "is_enabled" value. Use true/false, yes/no, or 1/0.' });
      return;
    }

    rows.push({
      row,
      productName,
      baseUrl,
      slug,
      platform,
      fallbackUrl: fallbackUrl || undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      utmContent: utmContent || undefined,
      utmTerm: utmTerm || undefined,
      isEnabled: isEnabled ?? undefined,
      notes: notes || undefined,
    });
  });

  return { rows, errors };
}
