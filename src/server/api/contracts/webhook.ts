import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const webhook = c.router(
  {
    stripe: {
      method: 'POST',
      path: '/stripe',
      metadata: {
        auth: 'public',
      } satisfies TsRestMetaData,
      body: z.any(),
      responses: {
        200: c.type<{ received: true }>(),
        400: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/webhooks' }
);
