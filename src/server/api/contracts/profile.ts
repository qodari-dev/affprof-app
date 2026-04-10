import { UpdateProfileBodySchema, ChangePasswordBodySchema } from '@/schemas/profile';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { Users } from '@/server/db';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const profile = c.router(
  {
    get: {
      method: 'GET',
      path: '/',
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Users>(),
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    update: {
      method: 'PATCH',
      path: '/',
      body: UpdateProfileBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Users>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        409: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    changePassword: {
      method: 'POST',
      path: '/change-password',
      body: ChangePasswordBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        204: z.void(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/profile' }
);
