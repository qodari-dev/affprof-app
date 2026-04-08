import { RegisterBodySchema } from '@/schemas/auth';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const auth = c.router(
  {
    register: {
      method: 'POST',
      path: '/register',
      body: RegisterBodySchema,
      metadata: {
        auth: 'public',
      } satisfies TsRestMetaData,
      responses: {
        201: c.type<{
          userId: string;
          plan: string;
          checkoutUrl: string | null;
        }>(),
        400: TsRestErrorSchema,
        409: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/auth' }
);
