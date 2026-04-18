import { z } from 'zod';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const storage = c.router(
  {
    /**
     * Delete a file uploaded by the current user.
     * Validates that the fileKey belongs to the authenticated user before deleting.
     */
    deleteFile: {
      method: 'DELETE',
      path: '/file',
      body: z.object({
        fileKey: z.string().min(1),
      }),
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        403: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/storage' },
);
