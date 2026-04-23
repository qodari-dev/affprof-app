import {
  CreateLinkBodySchema,
  ExportLinksResponseSchema,
  GetLinkQuerySchema,
  ImportLinksBodySchema,
  ImportLinksResponseSchema,
  ListLinksQuerySchema,
  UpdateLinkBodySchema,
  CheckLinksBodySchema,
} from '@/schemas/link';
import { UUIDParamSchema } from '@/schemas/shared';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { Paginated } from '@/server/utils/query/schemas';
import { Links } from '@/server/db';
import { initContract } from '@ts-rest/core';
import type { LinkCheckResult } from '@/server/services/link-checker';

const c = initContract();

export const link = c.router(
  {
    platforms: {
      method: 'GET',
      path: '/platforms',
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<string[]>(),
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
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
    exportCsv: {
      method: 'GET',
      path: '/export',
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: ExportLinksResponseSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    importCsv: {
      method: 'POST',
      path: '/import',
      body: ImportLinksBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: ImportLinksResponseSchema,
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
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
    check: {
      method: 'POST',
      path: '/:id/check',
      pathParams: UUIDParamSchema,
      body: c.noBody(),
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<LinkCheckResult>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    checkBulk: {
      method: 'POST',
      path: '/check-bulk',
      body: CheckLinksBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<LinkCheckResult[]>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/links' }
);
