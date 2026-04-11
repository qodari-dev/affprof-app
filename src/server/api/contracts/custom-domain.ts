import {
  CreateCustomDomainBodySchema,
  SetPrimaryCustomDomainBodySchema,
  VerifyCustomDomainBodySchema,
} from '@/schemas/custom-domain';
import { UUIDParamSchema } from '@/schemas/shared';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { CustomDomains } from '@/server/db';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const customDomain = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<CustomDomains[]>(),
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    create: {
      method: 'POST',
      path: '/',
      body: CreateCustomDomainBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        201: c.type<CustomDomains>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        403: TsRestErrorSchema,
        409: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    verify: {
      method: 'POST',
      path: '/:id/verify',
      pathParams: UUIDParamSchema,
      body: VerifyCustomDomainBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<CustomDomains>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    setPrimary: {
      method: 'POST',
      path: '/:id/set-primary',
      pathParams: UUIDParamSchema,
      body: SetPrimaryCustomDomainBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<CustomDomains>(),
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
        200: c.type<CustomDomains>(),
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/custom-domains' },
);
