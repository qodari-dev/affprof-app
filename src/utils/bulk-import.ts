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
  tags?: string[];
}

export const MAX_IMPORT_ROWS = 500;

const SLUG_REGEX = /^[a-z0-9-]+$/;

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

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePlatform(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

const TAG_REGEX = /^[a-z0-9][a-z0-9 _-]*[a-z0-9]$|^[a-z0-9]$/;

function parseTags(value: string): { tags: string[]; error?: string } {
  if (!value.trim()) return { tags: [] };

  const raw = value.split('|').map((t) => t.trim().toLowerCase()).filter(Boolean);

  if (raw.length > 10) {
    return { tags: [], error: `"tags": max 10 tags per link (got ${raw.length}).` };
  }

  const invalid = raw.filter((t) => t.length > 50 || !TAG_REGEX.test(t));
  if (invalid.length > 0) {
    return {
      tags: [],
      error: `"tags": "${invalid[0]}" is invalid — use lowercase letters, numbers, spaces, hyphens, or underscores.`,
    };
  }

  return { tags: [...new Set(raw)] }; // dedupe within the same cell
}

export const PRODUCT_IMPORT_COLUMNS = [
  { name: 'name', required: true, description: 'Product name', example: 'Blue Yeti Microphone' },
  { name: 'description', required: false, description: 'Optional description', example: 'USB microphone for creators' },
] as const;

export const PRODUCT_IMPORT_TEMPLATE_HEADERS = PRODUCT_IMPORT_COLUMNS.map((column) => column.name);

export const LINK_IMPORT_COLUMNS = [
  { name: 'product', required: true, description: 'Product name. Missing products will be created automatically.', example: 'Blue Yeti Microphone' },
  { name: 'link', required: true, description: 'Destination/base URL', example: 'https://www.amazon.com/dp/B08N5...' },
  { name: 'slug', required: true, description: 'Short-link slug. Lowercase letters, numbers, and hyphens only. Max 100 chars.', example: 'blue-yeti-amazon' },
  { name: 'platform', required: true, description: 'Affiliate network or marketplace. Normalized to lowercase automatically.', example: 'amazon' },
  { name: 'fallback_url', required: false, description: 'Optional fallback URL', example: 'https://yourbrand.com/backup' },
  { name: 'utm_source', required: false, description: 'Optional UTM source', example: 'instagram' },
  { name: 'utm_medium', required: false, description: 'Optional UTM medium', example: 'bio' },
  { name: 'utm_campaign', required: false, description: 'Optional UTM campaign', example: 'spring-launch' },
  { name: 'utm_content', required: false, description: 'Optional UTM content', example: 'hero-button' },
  { name: 'utm_term', required: false, description: 'Optional UTM term', example: 'creator-tools' },
  { name: 'is_enabled', required: false, description: 'true/false, yes/no, 1/0', example: 'true' },
  { name: 'notes', required: false, description: 'Internal note', example: 'Best performer in Instagram bio' },
  { name: 'tags', required: false, description: 'Pipe-separated tag names. Missing tags are created automatically. Max 10 per link.', example: 'amazon|tech|review' },
] as const;

export const LINK_IMPORT_TEMPLATE_HEADERS = LINK_IMPORT_COLUMNS.map((column) => column.name);

export function normalizeProductImportRows(rawRows: Array<Record<string, string>>) {
  const errors: ImportPreviewError[] = [];
  const rows: NormalizedProductImportRow[] = [];

  if (rawRows.length > MAX_IMPORT_ROWS) {
    errors.push({ row: 0, message: `File exceeds the ${MAX_IMPORT_ROWS}-row limit. Split it into smaller files.` });
    return { rows, errors };
  }

  const seenNames = new Set<string>();

  rawRows.forEach((raw, index) => {
    const row = index + 2;
    const rowErrors: string[] = [];

    const name = getValue(raw, ['name', 'product', 'product_name']).trim();
    const description = getValue(raw, ['description', 'desc']).trim();

    if (!name) {
      rowErrors.push('Missing required field "name".');
    } else if (name.length > 200) {
      rowErrors.push(`"name": "${name.slice(0, 40)}…" — must be 200 characters or fewer.`);
    } else {
      const nameKey = name.toLowerCase();
      if (seenNames.has(nameKey)) {
        rowErrors.push(`"name": "${name}" — duplicate in this file.`);
      } else {
        seenNames.add(nameKey);
      }
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((message) => errors.push({ row, message }));
      return;
    }

    rows.push({ row, name, description: description || undefined });
  });

  return { rows, errors };
}

export function normalizeLinkImportRows(rawRows: Array<Record<string, string>>) {
  const errors: ImportPreviewError[] = [];
  const rows: NormalizedLinkImportRow[] = [];

  if (rawRows.length > MAX_IMPORT_ROWS) {
    errors.push({ row: 0, message: `File exceeds the ${MAX_IMPORT_ROWS}-row limit. Split it into smaller files.` });
    return { rows, errors };
  }

  const seenSlugs = new Set<string>();

  rawRows.forEach((raw, index) => {
    const row = index + 2;
    const rowErrors: string[] = [];

    const productName = getValue(raw, ['product', 'product_name', 'productname']).trim();
    const baseUrl = getValue(raw, ['link', 'base_url', 'baseurl', 'url', 'destination_url', 'original_url', 'final_url']);
    const rawSlug = getValue(raw, ['slug']);
    const rawPlatform = getValue(raw, ['platform']);
    const fallbackUrl = getValue(raw, ['fallback_url', 'fallback']);
    const utmSource = getValue(raw, ['utm_source']).trim();
    const utmMedium = getValue(raw, ['utm_medium']).trim();
    const utmCampaign = getValue(raw, ['utm_campaign']).trim();
    const utmContent = getValue(raw, ['utm_content']).trim();
    const utmTerm = getValue(raw, ['utm_term']).trim();
    const notes = getValue(raw, ['notes', 'note']).trim();
    const isEnabledValue = getValue(raw, ['is_enabled', 'enabled', 'active']);
    const tagsRaw = getValue(raw, ['tags', 'tag']);

    // ── Required: product ──────────────────────────────────────────────────────
    if (!productName) {
      rowErrors.push('Missing required field "product".');
    }

    // ── Required: link (URL) ───────────────────────────────────────────────────
    if (!baseUrl) {
      rowErrors.push('Missing required field "link".');
    } else if (!isValidHttpUrl(baseUrl)) {
      rowErrors.push(`"link": "${baseUrl.slice(0, 50)}" — must start with http:// or https://.`);
    }

    // ── Required: slug ────────────────────────────────────────────────────────
    let slug = '';
    if (!rawSlug) {
      rowErrors.push('Missing required field "slug".');
    } else {
      slug = normalizeSlug(rawSlug);
      if (slug.length > 100) {
        rowErrors.push(`"slug": "${slug.slice(0, 40)}…" — must be 100 characters or fewer.`);
      } else if (!SLUG_REGEX.test(slug)) {
        rowErrors.push(`"slug": "${slug}" — only lowercase letters, numbers, and hyphens allowed.`);
      } else if (seenSlugs.has(slug)) {
        rowErrors.push(`"slug": "${slug}" — duplicate in this file.`);
      } else {
        seenSlugs.add(slug);
      }
    }

    // ── Required: platform ────────────────────────────────────────────────────
    let platform = '';
    if (!rawPlatform) {
      rowErrors.push('Missing required field "platform".');
    } else {
      platform = normalizePlatform(rawPlatform);
    }

    // ── Optional: fallback URL ────────────────────────────────────────────────
    if (fallbackUrl && !isValidHttpUrl(fallbackUrl)) {
      rowErrors.push(`"fallback_url": "${fallbackUrl.slice(0, 50)}" — must start with http:// or https://.`);
    }

    // ── Optional: is_enabled ──────────────────────────────────────────────────
    const isEnabled = parseBooleanLike(isEnabledValue);
    if (isEnabledValue && isEnabled === null) {
      rowErrors.push(`"is_enabled": "${isEnabledValue}" — use true/false, yes/no, or 1/0.`);
    }

    // ── Optional: tags ────────────────────────────────────────────────────────
    const { tags: parsedTags, error: tagsError } = parseTags(tagsRaw);
    if (tagsError) rowErrors.push(tagsError);

    if (rowErrors.length > 0) {
      rowErrors.forEach((message) => errors.push({ row, message }));
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
      tags: parsedTags.length > 0 ? parsedTags : undefined,
    });
  });

  return { rows, errors };
}
