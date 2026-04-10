import {
  createIncludeSchema,
  createListQuerySchema,
  DateOperatorsSchema,
  StringOperatorsSchema,
  UUIDOperatorsSchema,
} from "@/server/utils/query/schemas";
import { z } from "zod";

// ============================================
// WHERE
// ============================================

const ProductWhereFieldsSchema = z
  .object({
    id: z.union([z.uuid(), UUIDOperatorsSchema]).optional(),
    name: z.union([z.string(), StringOperatorsSchema]).optional(),
    userId: z.union([z.string(), StringOperatorsSchema]).optional(),
    createdAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
    updatedAt: z.union([z.coerce.date(), DateOperatorsSchema]).optional(),
  })
  .strict();

// ============================================
// SORT
// ============================================

const PRODUCT_SORT_FIELDS = ["name", "createdAt", "updatedAt"] as const;

// ============================================
// INCLUDE
// ============================================

const PRODUCT_INCLUDE_OPTIONS = ["links"] as const;
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

const OptionalImageUrlSchema = z
  .union([z.url(), z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined));

export const PRODUCT_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PRODUCT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const CreateProductBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: OptionalImageUrlSchema,
});

export const UpdateProductBodySchema = CreateProductBodySchema.partial();

export const PresignProductImageUploadBodySchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.enum(PRODUCT_IMAGE_ALLOWED_TYPES),
  fileSize: z.number().int().positive().max(PRODUCT_IMAGE_MAX_BYTES),
});

export const PresignProductImageUploadResponseSchema = z.object({
  fileKey: z.string().min(1),
  uploadUrl: z.url(),
  publicUrl: z.url(),
  method: z.literal('PUT'),
});

// ============================================
// TYPES
// ============================================

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
export type ProductInclude = (typeof PRODUCT_INCLUDE_OPTIONS)[number];
