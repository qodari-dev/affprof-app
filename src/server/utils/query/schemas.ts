import { z } from 'zod';

// ============================================
// FILTER OPERATORS BY TYPE
// ============================================

export const StringOperatorsSchema = z
  .object({
    eq: z.string().min(1).optional(),
    ne: z.string().min(1).optional(),
    contains: z.string().min(1).optional(),
    startsWith: z.string().min(1).optional(),
    endsWith: z.string().min(1).optional(),
    in: z.array(z.string().min(1)).min(1).optional(),
    notIn: z.array(z.string().min(1)).min(1).optional(),
    isNull: z.literal(true).optional(),
    isNotNull: z.literal(true).optional(),
    mode: z.enum(['default', 'insensitive']).default('insensitive').optional(),
  })
  .strict();

export const UUIDOperatorsSchema = z
  .object({
    eq: z.string().uuid().optional(),
    ne: z.string().uuid().optional(),
    in: z.array(z.string().uuid()).min(1).optional(),
    notIn: z.array(z.string().uuid()).min(1).optional(),
  })
  .strict();

export const NumberOperatorsSchema = z
  .object({
    eq: z.number().optional(),
    ne: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    in: z.array(z.number()).min(1).optional(),
    notIn: z.array(z.number()).min(1).optional(),
    isNull: z.literal(true).optional(),
    isNotNull: z.literal(true).optional(),
  })
  .strict();

export const BooleanOperatorsSchema = z
  .object({
    eq: z.boolean().optional(),
    ne: z.boolean().optional(),
    isNull: z.literal(true).optional(),
    isNotNull: z.literal(true).optional(),
  })
  .strict();

export const DateOperatorsSchema = z
  .object({
    eq: z.coerce.date().optional(),
    ne: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    isNull: z.literal(true).optional(),
    isNotNull: z.literal(true).optional(),
  })
  .strict();

export function EnumOperatorsSchema<T extends readonly [string, ...string[]]>(values: T) {
  return z
    .object({
      eq: z.enum(values).optional(),
      ne: z.enum(values).optional(),
      in: z.array(z.enum(values)).min(1).optional(),
      notIn: z.array(z.enum(values)).min(1).optional(),
      isNull: z.literal(true).optional(),
      isNotNull: z.literal(true).optional(),
    })
    .strict();
}

// ============================================
// WHERE SCHEMA FACTORY
// ============================================

export function createWhereSchema<T extends z.ZodRawShape>(fieldSchema: z.ZodObject<T>) {
  return z
    .object({
      and: z.array(fieldSchema).min(1).optional(),
      or: z.array(fieldSchema).min(1).optional(),
    })
    .strict();
}

// ============================================
// SORT SCHEMA FACTORY
// ============================================

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export function createSortSchema<T extends readonly [string, ...string[]]>(
  fields: T,
  opts?: { max?: number }
) {
  const FieldEnum = z.enum(fields);

  return z
    .array(
      z
        .object({
          field: FieldEnum,
          order: SortOrderSchema,
        })
        .strict()
    )
    .max(opts?.max ?? 3)
    .superRefine((items, ctx) => {
      const seen = new Set<string>();
      for (let i = 0; i < items.length; i++) {
        const f = items[i]?.field;
        if (!f) continue;
        if (seen.has(f)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate sort field: "${f}"`,
            path: [i, 'field'],
          });
        }
        seen.add(f);
      }
    })
    .optional();
}

// ============================================
// INCLUDE SCHEMA FACTORY
// ============================================

export function createIncludeSchema<T extends readonly [string, ...string[]]>(includes: T) {
  const IncludeEnum = z.enum(includes);

  return z
    .array(IncludeEnum)
    .superRefine((items, ctx) => {
      const seen = new Set<string>();
      for (let i = 0; i < items.length; i++) {
        const k = items[i];
        if (!k) continue;
        if (seen.has(k)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate include: "${k}"`,
            path: [i],
          });
        }
        seen.add(k);
      }
    })
    .optional();
}

// ============================================
// PAGINATION
// ============================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(10000).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// ============================================
// SEARCH
// ============================================

export const SearchSchema = z.object({
  search: z.string().optional(),
});

// ============================================
// LIST QUERY FACTORY
// ============================================

export function createListQuerySchema<
  TWhereFields extends z.ZodRawShape,
  TSortFields extends readonly [string, ...string[]],
  TIncludeFields extends readonly [string, ...string[]],
>(config: {
  whereFields: z.ZodObject<TWhereFields>;
  sortFields: TSortFields;
  includeFields: TIncludeFields;
  sortMax?: number;
}) {
  const { whereFields, sortFields, includeFields, sortMax } = config;

  return PaginationSchema.merge(SearchSchema).extend({
    where: createWhereSchema(whereFields).optional(),
    sort: createSortSchema(sortFields, { max: sortMax }),
    include: createIncludeSchema(includeFields),
  });
}

// ============================================
// RESPONSE HELPERS
// ============================================

export type Paginated<T> = { data: T[]; meta: PaginationMeta };
