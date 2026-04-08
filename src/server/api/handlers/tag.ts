import { db, tags } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { and, eq, sql } from 'drizzle-orm';
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

type TagColumn = keyof typeof tags.$inferSelect;

const TAG_FIELDS: FieldMap = {
  id: tags.id,
  name: tags.name,
  createdAt: tags.createdAt,
} satisfies Partial<Record<TagColumn, (typeof tags)[TagColumn]>>;

const TAG_QUERY_CONFIG: QueryConfig = {
  fields: TAG_FIELDS,
  searchFields: [tags.name],
  defaultSort: { column: tags.name, order: 'asc' },
};

const TAG_INCLUDES = createIncludeMap<typeof db.query.tags>()({
  linkTags: {
    relation: 'linkTags',
    config: {
      with: {
        link: true,
      },
    },
  },
});

// ============================================
// HANDLER
// ============================================

export const tag = tsr.router(contract.tag, {
  // ==========================================
  // LIST - GET /tags
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
      } = buildQuery({ page, limit, search, where, sort }, TAG_QUERY_CONFIG);

      const userFilter = eq(tags.userId, auth.userId);
      const finalWhere = whereClause ? and(userFilter, whereClause) : userFilter;

      const [data, countResult] = await Promise.all([
        db.query.tags.findMany({
          where: finalWhere,
          with: buildTypedIncludes(include, TAG_INCLUDES),
          orderBy: orderBy.length ? orderBy : undefined,
          limit: queryLimit,
          offset,
        }),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(tags)
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
        genericMsg: 'Error listing tags',
      });
    }
  },

  // ==========================================
  // GET - GET /tags/:id
  // ==========================================
  getById: async ({ params: { id }, query }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const tag = await db.query.tags.findFirst({
        where: and(eq(tags.id, id), eq(tags.userId, auth.userId)),
        with: buildTypedIncludes(query?.include, TAG_INCLUDES),
      });

      if (!tag) {
        throwHttpError({ status: 404, message: 'Tag not found', code: 'NOT_FOUND' });
      }

      return { status: 200, body: tag };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error fetching tag ${id}`,
      });
    }
  },

  // ==========================================
  // CREATE - POST /tags
  // ==========================================
  create: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const [newTag] = await db
        .insert(tags)
        .values({ ...body, userId: auth.userId })
        .returning();

      return { status: 201, body: newTag };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating tag',
      });
    }
  },

  // ==========================================
  // UPDATE - PATCH /tags/:id
  // ==========================================
  update: async ({ params: { id }, body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.tags.findFirst({
        where: and(eq(tags.id, id), eq(tags.userId, auth.userId)),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Tag not found', code: 'NOT_FOUND' });
      }

      const [updated] = await db
        .update(tags)
        .set(body)
        .where(eq(tags.id, id))
        .returning();

      return { status: 200, body: updated };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error updating tag ${id}`,
      });
    }
  },

  // ==========================================
  // DELETE - DELETE /tags/:id
  // ==========================================
  delete: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const existing = await db.query.tags.findFirst({
        where: and(eq(tags.id, id), eq(tags.userId, auth.userId)),
      });

      if (!existing) {
        throwHttpError({ status: 404, message: 'Tag not found', code: 'NOT_FOUND' });
      }

      await db.delete(tags).where(eq(tags.id, id));

      return { status: 200, body: existing };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error deleting tag ${id}`,
      });
    }
  },
});
