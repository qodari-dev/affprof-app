import {
  CreateTagBodySchema,
  GetTagQuerySchema,
  ListTagsQuerySchema,
  UpdateTagBodySchema,
} from '@/schemas/tag';
import { UUIDParamSchema } from '@/schemas/shared';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { Paginated } from '@/server/utils/query/schemas';
import { Tags } from '@/server/db';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const tag = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      query: ListTagsQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Paginated<Tags>>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    getById: {
      method: 'GET',
      path: '/:id',
      pathParams: UUIDParamSchema,
      query: GetTagQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Tags>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    create: {
      method: 'POST',
      path: '/',
      body: CreateTagBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        201: c.type<Tags>(),
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
      body: UpdateTagBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Tags>(),
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
        200: c.type<Tags>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/tags' }
);
