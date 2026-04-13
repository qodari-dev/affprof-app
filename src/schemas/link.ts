import {
  BooleanOperatorsSchema,
  createIncludeSchema,
  createListQuerySchema,
  DateOperatorsSchema,
  NumberOperatorsSchema,
  StringOperatorsSchema,
  UUIDOperatorsSchema,
} from '@/server/utils/query/schemas';
import { z } from 'zod';

// ============================================
// WHERE
// ============================================

const LinkWhereFieldsSchema = z
  .object({
    id: z.union([z.string().uuid(), UUIDOperatorsSchema]).optional(),
    productId: z.union([z.string().uuid(), UUIDOperatorsSchema]).optional(),
    brandId: z.union([z.string().uuid(), UUIDOperatorsSchema]).optional(),
    tagId: z.string().uuid().optional(),
    slug: z.union([z.string(), StringOperatorsSchema]).optional(),
    platform: z.union([z.string(), StringOperatorsSchema]).optional(),
    status: z.union([z.string(), StringOperatorsSchema]).optional(),
    isEnabled: z.union([z.boolean(), BooleanOperatorsSchema]).optional(),
    totalClicks: z.union([z.number(), NumberOperatorsSchema]).optional(),
    consecutiveFailures: z.union([z.number(), NumberOperatorsSchema]).optional(),
    createdAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
    updatedAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
  })
  .strict();

// ============================================
// SORT
// ============================================

const LINK_SORT_FIELDS = [
  'slug',
  'platform',
  'status',
  'totalClicks',
  'lastCheckedAt',
  'createdAt',
  'updatedAt',
] as const;

// ============================================
// INCLUDE
// ============================================

const LINK_INCLUDE_OPTIONS = ['product', 'brand', 'clicks', 'checks', 'linkTags'] as const;
const LinkIncludeSchema = createIncludeSchema(LINK_INCLUDE_OPTIONS);

// ============================================
// QUERY SCHEMAS
// ============================================

export const ListLinksQuerySchema = createListQuerySchema({
  whereFields: LinkWhereFieldsSchema,
  sortFields: LINK_SORT_FIELDS,
  includeFields: LINK_INCLUDE_OPTIONS,
  sortMax: 3,
});

export type ListLinksQuery = z.infer<typeof ListLinksQuerySchema>;

export const GetLinkQuerySchema = z.object({
  include: LinkIncludeSchema,
});

// ============================================
// MUTATIONS
// ============================================

export const CreateLinkBodySchema = z.object({
  productId: z.string().uuid(),
  brandId: z.union([z.string().uuid(), z.literal('')]).optional(),
  baseUrl: z.string().url().max(2048),
  fallbackUrl: z.string().url().max(2048).optional(),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  utmContent: z.string().max(255).optional(),
  utmTerm: z.string().max(255).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  platform: z.string().min(1).max(50).default('other'),
  notes: z.string().max(500).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const CheckLinksBodySchema = z.object({
  linkIds: z.array(z.string().uuid()).min(1).max(100),
});

const LinkImportRowSchema = z.object({
  row: z.number().int().min(2),
  productName: z.string().trim().min(1).max(200),
  baseUrl: z.string().url().max(2048),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  platform: z.string().min(1).max(50),
  fallbackUrl: z.string().url().max(2048).optional(),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  utmContent: z.string().max(255).optional(),
  utmTerm: z.string().max(255).optional(),
  isEnabled: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export const ImportLinksBodySchema = z.object({
  rows: z.array(LinkImportRowSchema).min(1).max(500),
});

export const ImportLinksResponseSchema = z.object({
  importedCount: z.number().int().min(0),
  skippedCount: z.number().int().min(0),
  createdProductsCount: z.number().int().min(0),
  errors: z.array(
    z.object({
      row: z.number().int().min(2),
      message: z.string(),
    }),
  ),
});

export const UpdateLinkBodySchema = z.object({
  brandId: z.union([z.string().uuid(), z.literal('')]).optional().nullable(),
  baseUrl: z.string().url().max(2048).optional(),
  fallbackUrl: z.string().url().max(2048).optional().nullable(),
  utmSource: z.string().max(255).optional().nullable(),
  utmMedium: z.string().max(255).optional().nullable(),
  utmCampaign: z.string().max(255).optional().nullable(),
  utmContent: z.string().max(255).optional().nullable(),
  utmTerm: z.string().max(255).optional().nullable(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }).optional(),
  platform: z.string().min(1).max(50).optional(),
  isEnabled: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

// ============================================
// TYPES
// ============================================

export type LinkSortField = (typeof LINK_SORT_FIELDS)[number];
export type LinkInclude = (typeof LINK_INCLUDE_OPTIONS)[number];
