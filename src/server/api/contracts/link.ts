import {
  CreateLinkBodySchema,
  GetLinkQuerySchema,
  ListLinksQuerySchema,
  UpdateLinkBodySchema,
} from '@/schemas/link';
import { UUIDParamSchema } from '@/schemas/shared';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { Paginated } from '@/server/utils/query/schemas';
import { Links } from '@/server/db';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const link = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      query: ListLinksQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Paginated<Links>>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    getById: {
      method: 'GET',
      path: '/:id',
      pathParams: UUIDParamSchema,
      query: GetLinkQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Links>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    create: {
      method: 'POST',
      path: '/',
      body: CreateLinkBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        201: c.type<Links>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        409: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    update: {
      method: 'PATCH',
      path: '/:id',
      pathParams: UUIDParamSchema,
      body: UpdateLinkBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Links>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    delete: {
      method: 'DELETE',
      path: '/:id',
      pathParams: UUIDParamSchema,
      body: c.noBody(),
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Links>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/links' }
);
