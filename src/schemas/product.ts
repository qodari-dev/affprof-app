import {
  BooleanOperatorsSchema,
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

const ProductWhereFieldsSchema = z
  .object({
    id: z.union([z.string().uuid(), UUIDOperatorsSchema]).optional(),
    name: z.union([z.string(), StringOperatorsSchema]).optional(),
    userId: z.union([z.string(), StringOperatorsSchema]).optional(),
    createdAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
    updatedAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
  })
  .strict();

// ============================================
// SORT
// ============================================

const PRODUCT_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;

// ============================================
// INCLUDE
// ============================================

const PRODUCT_INCLUDE_OPTIONS = ['links'] as const;
const ProductIncludeSchema = createIncludeSchema(PRODUCT_INCLUDE_OPTIONS);

// ============================================
// QUERY SCHEMAS
// ============================================

export const ListProductsQuerySchema = createListQuerySchema({
  whereFields: ProductWhereFieldsSchema,
  sortFields: PRODUCT_SORT_FIELDS,
  includeFields: PRODUCT_INCLUDE_OPTIONS,
  sortMax: 3,
});

export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;

export const GetProductQuerySchema = z.object({
  include: ProductIncludeSchema,
});

// ============================================
// MUTATIONS
// ============================================

export const CreateProductBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
});

export const UpdateProductBodySchema = CreateProductBodySchema.partial();

// ============================================
// TYPES
// ============================================

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
export type ProductInclude = (typeof PRODUCT_INCLUDE_OPTIONS)[number];
