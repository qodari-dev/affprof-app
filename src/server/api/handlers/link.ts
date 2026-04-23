import { db, links, linkTags, products, tags } from '@/server/db';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { and, asc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { checkLink, checkLinks } from '@/server/services/link-checker';
import { normalizeTrackedDestinationInput } from '@/utils/tracked-destination-url';
import { enforceLinkLimit, requireProPlan } from '@/server/services/plan-limits';
import { pickTagColor } from '@/utils/tag-color';

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
  // PLATFORMS - GET /links/platforms
  // ==========================================
  platforms: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const rows = await db
        .selectDistinct({ platform: links.platform })
        .from(links)
        .where(and(eq(links.userId, auth.userId), isNull(links.deletedAt), isNotNull(links.platform)))
        .orderBy(asc(links.platform));

      const platforms = rows.map((r) => r.platform).filter((p): p is string => p !== null);

      return { status: 200 as const, body: platforms };
    } catch (e) {
      return genericTsRestErrorResponse(e, { genericMsg: 'Error fetching link platforms' });
    }
  },

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

      await enforceLinkLimit(auth.userId);
      if (body.fallbackUrl) await requireProPlan(auth.userId, 'Fallback URL');

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

      await requireProPlan(auth.userId, 'Bulk link import');

      const [existingProducts, existingLinks] = await Promise.all([
        db.query.products.findMany({
          where: and(eq(products.userId, auth.userId), isNull(products.deletedAt)),
          columns: { id: true, name: true },
        }),
        db.query.links.findMany({
          where: and(eq(links.userId, auth.userId), isNull(links.deletedAt)),
          columns: { id: true, slug: true },
        }),
      ]);

      // ── Validation pass (reads only — outside transaction) ──────────────────
      const productMap = new Map(
        existingProducts.map((p) => [p.name.trim().toLowerCase(), p]),
      );
      // Map of slug → existing link id (for upsert)
      const existingLinkMap = new Map(existingLinks.map((l) => [l.slug.trim().toLowerCase(), l.id]));
      const seenSlugs = new Set<string>();
      const missingProductNames = new Set<string>();
      const skippedRows = new Set<number>();
      const errors: Array<{ row: number; message: string }> = [];
      const allTagNames = new Set<string>();

      for (const row of body.rows) {
        const normalizedSlug = row.slug.trim().toLowerCase();
        const normalizedProductName = row.productName.trim().toLowerCase();

        if (seenSlugs.has(normalizedSlug)) {
          skippedRows.add(row.row);
          errors.push({ row: row.row, message: `Slug "${row.slug}" is duplicated in this file.` });
          continue;
        }

        seenSlugs.add(normalizedSlug);

        if (!productMap.has(normalizedProductName)) {
          missingProductNames.add(row.productName.trim());
        }

        row.tags?.forEach((t) => allTagNames.add(t));
      }

      // Pre-fetch existing tags (read outside tx to keep tx short)
      const existingTagsRows = allTagNames.size > 0
        ? await db.query.tags.findMany({
            where: and(eq(tags.userId, auth.userId), inArray(tags.name, Array.from(allTagNames))),
            columns: { id: true, name: true },
          })
        : [];

      // ── All writes inside a single transaction ────────────────────────────────
      const result = await db.transaction(async (tx) => {
        // 1. Create missing products
        let createdProductsCount = 0;
        if (missingProductNames.size > 0) {
          const insertedProducts = await tx
            .insert(products)
            .values(Array.from(missingProductNames).map((name) => ({ userId: auth.userId, name })))
            .returning({ id: products.id, name: products.name });

          createdProductsCount = insertedProducts.length;
          for (const p of insertedProducts) {
            productMap.set(p.name.trim().toLowerCase(), p);
          }
        }

        // 2. Resolve tags (create missing ones)
        const tagMap = new Map<string, string>(); // name → id
        for (const tag of existingTagsRows) {
          tagMap.set(tag.name.toLowerCase(), tag.id);
        }

        let createdTagsCount = 0;
        if (allTagNames.size > 0) {
          const missingTagNames = Array.from(allTagNames).filter((n) => !tagMap.has(n));
          if (missingTagNames.length > 0) {
            const newTags = await tx
              .insert(tags)
              .values(missingTagNames.map((name) => ({ userId: auth.userId, name, color: pickTagColor(name) })))
              .returning({ id: tags.id, name: tags.name });
            createdTagsCount = newTags.length;
            for (const tag of newTags) {
              tagMap.set(tag.name.toLowerCase(), tag.id);
            }
          }
        }

        // 3. Split rows into inserts and updates
        const rowsToInsert: Array<typeof links.$inferInsert> = [];
        const rowsToUpdate: Array<{ id: string; data: Partial<typeof links.$inferInsert>; rowTags?: string[] }> = [];

        for (const row of body.rows) {
          if (skippedRows.has(row.row)) continue;

          const product = productMap.get(row.productName.trim().toLowerCase());
          if (!product) {
            skippedRows.add(row.row);
            errors.push({ row: row.row, message: `Product "${row.productName}" could not be resolved.` });
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

          const linkData = {
            userId: auth.userId,
            productId: product.id,
            slug: row.slug.trim(),
            platform: row.platform.trim(),
            baseUrl: destination.baseUrl,
            originalUrl: destination.originalUrl,
            utmSource: row.utmSource ?? null,
            utmMedium: row.utmMedium ?? null,
            utmCampaign: row.utmCampaign ?? null,
            utmContent: row.utmContent ?? null,
            utmTerm: row.utmTerm ?? null,
            fallbackUrl: row.fallbackUrl ?? null,
            isEnabled: row.isEnabled ?? true,
            notes: row.notes ?? null,
          };

          const existingId = existingLinkMap.get(row.slug.trim().toLowerCase());
          if (existingId) {
            rowsToUpdate.push({ id: existingId, data: linkData, rowTags: row.tags });
          } else {
            rowsToInsert.push(linkData);
          }
        }

        // 4. Insert new links
        let insertedLinks: Array<{ id: string; slug: string }> = [];
        if (rowsToInsert.length > 0) {
          insertedLinks = await tx
            .insert(links)
            .values(rowsToInsert)
            .returning({ id: links.id, slug: links.slug });
        }

        // 5. Update existing links
        let updatedLinks: Array<{ id: string; slug: string }> = [];
        if (rowsToUpdate.length > 0) {
          const updateResults = await Promise.all(
            rowsToUpdate.map(({ id, data }) =>
              tx
                .update(links)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(links.id, id), eq(links.userId, auth.userId)))
                .returning({ id: links.id, slug: links.slug }),
            ),
          );
          updatedLinks = updateResults.flat();

          // Replace tags for updated links
          const updatedIds = updatedLinks.map((l) => l.id);
          if (updatedIds.length > 0) {
            await tx.delete(linkTags).where(inArray(linkTags.linkId, updatedIds));
          }
        }

        // 6. Insert link_tags for both new and updated links
        const allProcessed = [
          ...insertedLinks.map((l) => ({ ...l, tags: body.rows.find((r) => r.slug === l.slug)?.tags })),
          ...updatedLinks.map((l) => ({ ...l, tags: rowsToUpdate.find((r) => r.id === l.id)?.rowTags })),
        ];

        if (allProcessed.length > 0 && tagMap.size > 0) {
          const linkTagValues: Array<{ linkId: string; tagId: string }> = [];
          for (const { id, tags: rowTags } of allProcessed) {
            if (rowTags?.length) {
              for (const tagName of rowTags) {
                const tagId = tagMap.get(tagName);
                if (tagId) linkTagValues.push({ linkId: id, tagId });
              }
            }
          }
          if (linkTagValues.length > 0) {
            await tx.insert(linkTags).values(linkTagValues);
          }
        }

        return {
          createdCount: insertedLinks.length,
          updatedCount: updatedLinks.length,
          createdProductsCount,
          createdTagsCount,
        };
      });

      return {
        status: 200 as const,
        body: {
          createdCount: result.createdCount,
          updatedCount: result.updatedCount,
          skippedCount: errors.length,
          createdProductsCount: result.createdProductsCount,
          createdTagsCount: result.createdTagsCount,
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

      await requireProPlan(auth.userId, 'Bulk link check');

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
