import { db, brands } from '@/server/db';
import { BRAND_LOGO_ALLOWED_TYPES, BRAND_LOGO_MAX_BYTES } from '@/schemas/brand';
import { getAuthContext } from '@/server/utils/auth-context';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import {
  buildDatedFileKey,
  createSpacesPresignedPutUrl,
  createSpacesPublicUrl,
} from '@/server/utils/storage/spaces-presign';
import { tsr } from '@ts-rest/serverless/next';
import { and, asc, desc, eq } from 'drizzle-orm';

import { contract } from '../contracts';

async function getBrandOrThrow(userId: string, id: string) {
  const existing = await db.query.brands.findFirst({
    where: and(eq(brands.id, id), eq(brands.userId, userId)),
  });

  if (!existing) {
    throwHttpError({ status: 404, message: 'Brand not found', code: 'NOT_FOUND' });
  }

  return existing;
}

async function clearDefaultBrands(userId: string) {
  await db
    .update(brands)
    .set({ isDefault: false })
    .where(and(eq(brands.userId, userId), eq(brands.isDefault, true)));
}

export const brandHandler = tsr.router(contract.brand, {
  list: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const data = await db.query.brands.findMany({
        where: eq(brands.userId, auth.userId),
        orderBy: [desc(brands.isDefault), asc(brands.name)],
      });

      return {
        status: 200 as const,
        body: data,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error listing brands',
      });
    }
  },

  create: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const existingBrands = await db.query.brands.findMany({
        where: eq(brands.userId, auth.userId),
        columns: { id: true },
      });
      const shouldBeDefault = body.isDefault || existingBrands.length === 0;

      if (shouldBeDefault) {
        await clearDefaultBrands(auth.userId);
      }

      const [created] = await db
        .insert(brands)
        .values({
          userId: auth.userId,
          name: body.name,
          logoUrl: body.logoUrl,
          qrForeground: body.qrForeground,
          qrBackground: body.qrBackground,
          isDefault: shouldBeDefault,
        })
        .returning();

      return {
        status: 201 as const,
        body: created,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error creating brand',
      });
    }
  },

  update: async ({ params: { id }, body }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const existing = await getBrandOrThrow(auth.userId, id);

      if (body.isDefault) {
        await clearDefaultBrands(auth.userId);
      }

      const [updated] = await db
        .update(brands)
        .set({
          name: body.name ?? existing.name,
          logoUrl: body.logoUrl ?? existing.logoUrl,
          qrForeground: body.qrForeground ?? existing.qrForeground,
          qrBackground: body.qrBackground ?? existing.qrBackground,
          isDefault: body.isDefault ?? existing.isDefault,
        })
        .where(eq(brands.id, id))
        .returning();

      return {
        status: 200 as const,
        body: updated,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error updating brand ${id}`,
      });
    }
  },

  setDefault: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      await getBrandOrThrow(auth.userId, id);

      await clearDefaultBrands(auth.userId);

      const [updated] = await db
        .update(brands)
        .set({ isDefault: true })
        .where(eq(brands.id, id))
        .returning();

      return {
        status: 200 as const,
        body: updated,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error setting default brand ${id}`,
      });
    }
  },

  presignLogoUpload: async ({ body }, { request }) => {
    try {
      await getAuthContext(request);

      if (!BRAND_LOGO_ALLOWED_TYPES.includes(body.contentType)) {
        throwHttpError({
          status: 400,
          message: 'Only JPG, PNG, and WEBP images are allowed',
          code: 'BAD_REQUEST',
        });
      }

      if (body.fileSize > BRAND_LOGO_MAX_BYTES) {
        throwHttpError({
          status: 400,
          message: 'Image is too large',
          code: 'BAD_REQUEST',
        });
      }

      const fileKey = buildDatedFileKey('brands', body.fileName);
      const uploadUrl = createSpacesPresignedPutUrl(fileKey, body.contentType);
      const publicUrl = createSpacesPublicUrl(fileKey);

      return {
        status: 200 as const,
        body: {
          fileKey,
          uploadUrl,
          publicUrl,
          method: 'PUT' as const,
        },
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error generating brand logo upload URL',
      });
    }
  },

  delete: async ({ params: { id } }, { request }) => {
    try {
      const auth = await getAuthContext(request);
      const existing = await getBrandOrThrow(auth.userId, id);

      await db.delete(brands).where(eq(brands.id, id));

      return {
        status: 200 as const,
        body: existing,
      };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: `Error deleting brand ${id}`,
      });
    }
  },
});
