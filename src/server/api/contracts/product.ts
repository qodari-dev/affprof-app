import {
  CreateProductBodySchema,
  GetProductQuerySchema,
  ListProductsQuerySchema,
  UpdateProductBodySchema,
} from '@/schemas/product';
import { UUIDParamSchema } from '@/schemas/shared';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { Paginated } from '@/server/utils/query/schemas';
import { Products } from '@/server/db';
import { initContract } from '@ts-rest/core';

const c = initContract();
const resourceKey = 'products';

export const product = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      query: ListProductsQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Paginated<Products>>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    getById: {
      method: 'GET',
      path: '/:id',
      pathParams: UUIDParamSchema,
      query: GetProductQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Products>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    create: {
      method: 'POST',
      path: '/',
      body: CreateProductBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        201: c.type<Products>(),
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
      body: UpdateProductBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<Products>(),
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
        200: c.type<Products>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/products' }
);
