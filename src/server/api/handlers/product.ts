import { db, products } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { contract } from '../contracts';

import { buildTypedIncludes, createIncludeMap } from '@/server/utils/query/include-builder';
import {
  buildPaginationMeta,
  buildQuery,
  FieldMap,
  QueryConfig,
} from '@/server/utils/query/query-builder';

// ============================================
// CONFIG
// ============================================

type ProductColumn = keyof typeof products.$inferSelect;

const PRODUCT_FIELDS: FieldMap = {
  id: products.id,
  name: products.name,
  userId: products.userId,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
} satisfies Partial<Record<ProductColumn, (typeof products)[ProductColumn]>>;

const PRODUCT_QUERY_CONFIG: QueryConfig = {
  fields: PRODUCT_FIELDS,
  searchFields: [products.name],
  defaultSort: { column: products.createdAt, order: 'desc' },
};

const PRODUCT_INCLUDES = createIncludeMap<typeof db.query.products>()({
  links: {
    relation: 'links',
    config: true,
  },
});

// ============================================
// HANDLER
// ============================================

export const product = tsr.router(contract.product, {
  // ==========================================
  // LIST - GET /products
  // ==========================================
  list: async ({ query }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const { page, limit, search, where, sort, include } = query;

      const {
        whereClause,
        orderBy,
        limit: queryLimit,
        offset,
      } = buildQuery({ page, limit, search, where, sort }, PRODUCT_QUERY_CONFIG);

      const userFilter = eq(products.userId, auth.userId);
      const notDeleted = isNull(products.deletedAt);
      const finalWhere = whereClause
        ? and(userFilter, notDeleted, whereClause)
        : and(userFilter, notDeleted);

      const [data, countResult] = await Promise.all([
        db.query.products.findMany({
          where: finalWhere,
          with: buildTypedIncludes(include, PRODUCT_INCLUDES),
          orderBy: orderBy.length ? orderBy : undefined,
          limit: queryLimit,
          offset,
        }),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(products)
          .where(finalWhere),
      ]);

      const totalCount = countResult[0]?.count ?? 0;

      return {
        status: 200 as const,
        body: {
          data,
          meta: buildPaginationMeta(totalCount, page, limit),
        },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error listing products',
      });
    }
  },

  // ==========================================
  // GET - GET /products/:id
  // ==========================================
  getById: async ({ params: { id }, query }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, id),
          eq(products.userId, auth.userId),
          isNull(products.deletedAt)
        ),
        with: buildTypedIncludes(query?.include, PRODUCT_INCLUDES),
      });

      if (!product) {
        throwHttpError({ status: 404, message: 'Product not found', code: 'NOT_FOUND' });
      }

      return { status: 200, body: product };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error fetching product ${id}`,
      });
    }
  },

  // ==========================================
  // CREATE - POST /products
  // ==========================================
  create: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const [newProduct] = await db
        .insert(products)
        .values({ ...body, userId: auth.userId })
        .returning();

      return { status: 201, body: newProduct };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating product',
      });
    }
  },

  // ==========================================
  // UPDATE - PATCH /products/:id
  // ==========================================
  update: async ({ params: { id }, body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.products.findFirst({
        where: and(
          eq(products.id, id),
          eq(products.userId, auth.userId),
          isNull(products.deletedAt)
        ),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Product not found', code: 'NOT_FOUND' });
      }

      const [updated] = await db
        .update(products)
        .set(body)
        .where(eq(products.id, id))
        .returning();

      return { status: 200, body: updated };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error updating product ${id}`,
      });
    }
  },

  // ==========================================
  // DELETE - DELETE /products/:id (soft delete)
  // ==========================================
  delete: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.products.findFirst({
        where: and(
          eq(products.id, id),
          eq(products.userId, auth.userId),
          isNull(products.deletedAt)
        ),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Product not found', code: 'NOT_FOUND' });
      }

      const [deleted] = await db
        .update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, id))
        .returning();

      return { status: 200, body: deleted };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error deleting product ${id}`,
      });
    }
  },
});
