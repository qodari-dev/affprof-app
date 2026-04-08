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

const LINK_INCLUDE_OPTIONS = ['product', 'clicks', 'checks', 'linkTags'] as const;
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
  originalUrl: z.string().url().max(2048),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  platform: z.string().min(1).max(50).default('other'),
  notes: z.string().max(500).optional(),
});

export const UpdateLinkBodySchema = z.object({
  originalUrl: z.string().url().max(2048).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }).optional(),
  platform: z.string().min(1).max(50).optional(),
  isEnabled: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

// ============================================
// TYPES
// ============================================

export type LinkSortField = (typeof LINK_SORT_FIELDS)[number];
export type LinkInclude = (typeof LINK_INCLUDE_OPTIONS)[number];
