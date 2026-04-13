import { db, links, linkTags, products } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { checkLink, checkLinks } from '@/server/services/link-checker';
import { normalizeTrackedDestinationInput } from '@/utils/tracked-destination-url';

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
  brandId: links.brandId,
  baseUrl: links.baseUrl,
  slug: links.slug,
  platform: links.platform,
  fallbackUrl: links.fallbackUrl,
  utmSource: links.utmSource,
  utmMedium: links.utmMedium,
  utmCampaign: links.utmCampaign,
  utmContent: links.utmContent,
  utmTerm: links.utmTerm,
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
  searchFields: [links.slug, links.originalUrl, links.baseUrl, links.platform, links.utmCampaign],
  defaultSort: { column: links.createdAt, order: 'desc' },
};

const LINK_INCLUDES = createIncludeMap<typeof db.query.links>()({
  product: {
    relation: 'product',
    config: true,
  },
  brand: {
    relation: 'brand',
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

function extractTagIdFilter(where: { and?: Record<string, unknown>[]; or?: Record<string, unknown>[] } | undefined) {
  const conditions = [...(where?.and ?? []), ...(where?.or ?? [])];

  for (const condition of conditions) {
    if (typeof condition.tagId === 'string') {
      return condition.tagId;
    }
  }

  return undefined;
}

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
      const tagId = extractTagIdFilter(where);

      const {
        whereClause,
        orderBy,
        limit: queryLimit,
        offset,
      } = buildQuery({ page, limit, search, where, sort }, LINK_QUERY_CONFIG);

      const taggedLinkIds = tagId
        ? (
            await db
              .select({ linkId: linkTags.linkId })
              .from(linkTags)
              .where(eq(linkTags.tagId, tagId))
          ).map((row) => row.linkId)
        : undefined;

      if (tagId && (!taggedLinkIds || taggedLinkIds.length === 0)) {
        return {
          status: 200 as const,
          body: {
            data: [],
            meta: buildPaginationMeta(0, page, limit),
          },
        };
      }

      const userFilter = eq(links.userId, auth.userId);
      const notDeleted = isNull(links.deletedAt);
      const tagFilter = taggedLinkIds?.length
        ? inArray(links.id, taggedLinkIds)
        : undefined;
      const finalWhere = whereClause
        ? and(userFilter, notDeleted, whereClause, tagFilter)
        : and(userFilter, notDeleted, tagFilter);

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

      const { tagIds, ...linkData } = body;
      const destination = normalizeTrackedDestinationInput(linkData);

      const [newLink] = await db
        .insert(links)
        .values({
          ...linkData,
          brandId: linkData.brandId || null,
          ...destination,
          userId: auth.userId,
        })
        .returning();

      if (tagIds?.length) {
        await db.insert(linkTags).values(
          tagIds.map((tagId) => ({ linkId: newLink.id, tagId }))
        );
      }

      const result = await db.query.links.findFirst({
        where: eq(links.id, newLink.id),
        with: { linkTags: { with: { tag: true } } },
      });

      return { status: 201, body: result! };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating link',
      });
    }
  },

  // ==========================================
  // IMPORT - POST /links/import
  // ==========================================
  importCsv: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const [existingProducts, existingLinks] = await Promise.all([
        db.query.products.findMany({
          where: and(eq(products.userId, auth.userId), isNull(products.deletedAt)),
          columns: {
            id: true,
            name: true,
          },
        }),
        db.query.links.findMany({
          where: eq(links.userId, auth.userId),
          columns: {
            slug: true,
          },
        }),
      ]);

      const productMap = new Map(
        existingProducts.map((product) => [product.name.trim().toLowerCase(), product]),
      );
      const existingSlugs = new Set(existingLinks.map((link) => link.slug.trim().toLowerCase()));
      const seenSlugs = new Set<string>();
      const missingProductNames = new Set<string>();
      const skippedRows = new Set<number>();
      const errors: Array<{ row: number; message: string }> = [];

      for (const row of body.rows) {
        const normalizedSlug = row.slug.trim().toLowerCase();
        const normalizedProductName = row.productName.trim().toLowerCase();

        if (existingSlugs.has(normalizedSlug)) {
          skippedRows.add(row.row);
          errors.push({
            row: row.row,
            message: `Slug "${row.slug}" already exists and was skipped.`,
          });
          continue;
        }

        if (seenSlugs.has(normalizedSlug)) {
          skippedRows.add(row.row);
          errors.push({
            row: row.row,
            message: `Slug "${row.slug}" is duplicated in this file.`,
          });
          continue;
        }

        seenSlugs.add(normalizedSlug);

        if (!productMap.has(normalizedProductName)) {
          missingProductNames.add(row.productName.trim());
        }
      }

      let createdProductsCount = 0;
      if (missingProductNames.size > 0) {
        const insertedProducts = await db
          .insert(products)
          .values(
            Array.from(missingProductNames).map((name) => ({
              userId: auth.userId,
              name,
            })),
          )
          .returning({
            id: products.id,
            name: products.name,
          });

        createdProductsCount = insertedProducts.length;
        for (const product of insertedProducts) {
          productMap.set(product.name.trim().toLowerCase(), product);
        }
      }

      const rowsToInsert: Array<typeof links.$inferInsert> = [];

      for (const row of body.rows) {
        if (skippedRows.has(row.row)) continue;

        const product = productMap.get(row.productName.trim().toLowerCase());

        if (!product) {
          skippedRows.add(row.row);
          errors.push({
            row: row.row,
            message: `Product "${row.productName}" could not be resolved.`,
          });
          continue;
        }

        const destination = normalizeTrackedDestinationInput({
          baseUrl: row.baseUrl,
          utmSource: row.utmSource,
          utmMedium: row.utmMedium,
          utmCampaign: row.utmCampaign,
          utmContent: row.utmContent,
          utmTerm: row.utmTerm,
        });

        rowsToInsert.push({
          userId: auth.userId,
          productId: product.id,
          slug: row.slug.trim(),
          platform: row.platform.trim(),
          baseUrl: destination.baseUrl,
          originalUrl: destination.originalUrl,
          utmSource: row.utmSource,
          utmMedium: row.utmMedium,
          utmCampaign: row.utmCampaign,
          utmContent: row.utmContent,
          utmTerm: row.utmTerm,
          fallbackUrl: row.fallbackUrl,
          isEnabled: row.isEnabled ?? true,
          notes: row.notes,
        });
      }

      if (rowsToInsert.length > 0) {
        await db.insert(links).values(rowsToInsert);
      }

      return {
        status: 200 as const,
        body: {
          importedCount: rowsToInsert.length,
          skippedCount: errors.length,
          createdProductsCount,
          errors,
        },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error importing links',
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

      const { tagIds, ...linkData } = body;
      const destination = linkData.baseUrl
        ? normalizeTrackedDestinationInput({
            baseUrl: linkData.baseUrl,
            utmSource: linkData.utmSource,
            utmMedium: linkData.utmMedium,
            utmCampaign: linkData.utmCampaign,
            utmContent: linkData.utmContent,
            utmTerm: linkData.utmTerm,
          })
        : undefined;

      await db
        .update(links)
        .set(
          destination
            ? {
                ...linkData,
                brandId: linkData.brandId === undefined ? existing.brandId : (linkData.brandId || null),
                ...destination,
              }
            : {
                ...linkData,
                brandId: linkData.brandId === undefined ? existing.brandId : (linkData.brandId || null),
              }
        )
        .where(eq(links.id, id));

      if (tagIds !== undefined) {
        await db.delete(linkTags).where(eq(linkTags.linkId, id));

        if (tagIds.length) {
          await db.insert(linkTags).values(
            tagIds.map((tagId) => ({ linkId: id, tagId }))
          );
        }
      }

      const result = await db.query.links.findFirst({
        where: eq(links.id, id),
        with: { linkTags: { with: { tag: true } } },
      });

      return { status: 200, body: result! };
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

  // ==========================================
  // CHECK - POST /links/:id/check
  // ==========================================
  check: async ({ params: { id } }, { request }) => {
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

      const result = await checkLink(id);
      return { status: 200, body: result };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error checking link ${id}`,
      });
    }
  },

  // ==========================================
  // CHECK BULK - POST /links/check-bulk
  // ==========================================
  checkBulk: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      // Verify all links belong to the user
      const userLinks = await db.query.links.findMany({
        where: and(
          inArray(links.id, body.linkIds),
          eq(links.userId, auth.userId),
          isNull(links.deletedAt)
        ),
        columns: { id: true },
      });

      const validIds = userLinks.map((l) => l.id);
      if (validIds.length === 0) {
        throwHttpError({ status: 404, message: 'No valid links found', code: 'NOT_FOUND' });
      }

      const results = await checkLinks(validIds);
      return { status: 200, body: results };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error checking links',
      });
    }
  },
});
