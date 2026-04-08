import {
  createIncludeSchema,
  createListQuerySchema,
  DateOperatorsSchema,
  StringOperatorsSchema,
  UUIDOperatorsSchema,
} from '@/server/utils/query/schemas';
import { z } from 'zod';

// ============================================
// WHERE
// ============================================

const TagWhereFieldsSchema = z
  .object({
    id: z.union([z.string().uuid(), UUIDOperatorsSchema]).optional(),
    name: z.union([z.string(), StringOperatorsSchema]).optional(),
    createdAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
  })
  .strict();

// ============================================
// SORT
// ============================================

const TAG_SORT_FIELDS = ['name', 'createdAt'] as const;

// ============================================
// INCLUDE
// ============================================

const TAG_INCLUDE_OPTIONS = ['linkTags'] as const;
const TagIncludeSchema = createIncludeSchema(TAG_INCLUDE_OPTIONS);

// ============================================
// QUERY SCHEMAS
// ============================================

export const ListTagsQuerySchema = createListQuerySchema({
  whereFields: TagWhereFieldsSchema,
  sortFields: TAG_SORT_FIELDS,
  includeFields: TAG_INCLUDE_OPTIONS,
  sortMax: 2,
});

export type ListTagsQuery = z.infer<typeof ListTagsQuerySchema>;

export const GetTagQuerySchema = z.object({
  include: TagIncludeSchema,
});

// ============================================
// MUTATIONS
// ============================================

export const CreateTagBodySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g. #FF5733)',
  }).optional(),
});

export const UpdateTagBodySchema = CreateTagBodySchema.partial();

// ============================================
// TYPES
// ============================================

export type TagSortField = (typeof TAG_SORT_FIELDS)[number];
export type TagInclude = (typeof TAG_INCLUDE_OPTIONS)[number];
