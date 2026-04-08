import { db, links } from '@/server/db';
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

type LinkColumn = keyof typeof links.$inferSelect;

const LINK_FIELDS: FieldMap = {
  id: links.id,
  productId: links.productId,
  slug: links.slug,
  platform: links.platform,
  status: links.status,
  isEnabled: links.isEnabled,
  totalClicks: links.totalClicks,
  consecutiveFailures: links.consecutiveFailures,
  lastCheckedAt: links.lastCheckedAt,
  createdAt: links.createdAt,
  updatedAt: links.updatedAt,
} satisfies Partial<Record<LinkColumn, (typeof links)[LinkColumn]>>;

const LINK_QUERY_CONFIG: QueryConfig = {
  fields: LINK_FIELDS,
  searchFields: [links.slug, links.originalUrl, links.platform],
  defaultSort: { column: links.createdAt, order: 'desc' },
};

const LINK_INCLUDES = createIncludeMap<typeof db.query.links>()({
  product: {
    relation: 'product',
    config: true,
  },
  clicks: {
    relation: 'clicks',
    config: true,
  },
  checks: {
    relation: 'checks',
    config: true,
  },
  linkTags: {
    relation: 'linkTags',
    config: {
      with: {
        tag: true,
      },
    },
  },
});

// ============================================
// HANDLER
// ============================================

export const link = tsr.router(contract.link, {
  // ==========================================
  // LIST - GET /links
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
      } = buildQuery({ page, limit, search, where, sort }, LINK_QUERY_CONFIG);

      const userFilter = eq(links.userId, auth.userId);
      const notDeleted = isNull(links.deletedAt);
      const finalWhere = whereClause
        ? and(userFilter, notDeleted, whereClause)
        : and(userFilter, notDeleted);

      const [data, countResult] = await Promise.all([
        db.query.links.findMany({
          where: finalWhere,
          with: buildTypedIncludes(include, LINK_INCLUDES),
          orderBy: orderBy.length ? orderBy : undefined,
          limit: queryLimit,
          offset,
        }),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(links)
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
        genericMsg: 'Error listing links',
      });
    }
  },

  // ==========================================
  // GET - GET /links/:id
  // ==========================================
  getById: async ({ params: { id }, query }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const link = await db.query.links.findFirst({
        where: and(
          eq(links.id, id),
          eq(links.userId, auth.userId),
          isNull(links.deletedAt)
        ),
        with: buildTypedIncludes(query?.include, LINK_INCLUDES),
      });

      if (!link) {
        throwHttpError({ status: 404, message: 'Link not found', code: 'NOT_FOUND' });
      }

      return { status: 200, body: link };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error fetching link ${id}`,
      });
    }
  },

  // ==========================================
  // CREATE - POST /links
  // ==========================================
  create: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const [newLink] = await db
        .insert(links)
        .values({ ...body, userId: auth.userId })
        .returning();

      return { status: 201, body: newLink };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating link',
      });
    }
  },

  // ==========================================
  // UPDATE - PATCH /links/:id
  // ==========================================
  update: async ({ params: { id }, body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.links.findFirst({
        where: and(
          eq(links.id, id),
          eq(links.userId, auth.userId),
          isNull(links.deletedAt)
        ),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Link not found', code: 'NOT_FOUND' });
      }

      const [updated] = await db
        .update(links)
        .set(body)
        .where(eq(links.id, id))
        .returning();

      return { status: 200, body: updated };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error updating link ${id}`,
      });
    }
  },

  // ==========================================
  // DELETE - DELETE /links/:id (soft delete)
  // ==========================================
  delete: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.links.findFirst({
        where: and(
          eq(links.id, id),
          eq(links.userId, auth.userId),
          isNull(links.deletedAt)
        ),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Link not found', code: 'NOT_FOUND' });
      }

      const [deleted] = await db
        .update(links)
        .set({ deletedAt: new Date() })
        .where(eq(links.id, id))
        .returning();

      return { status: 200, body: deleted };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error deleting link ${id}`,
      });
    }
  },
});
