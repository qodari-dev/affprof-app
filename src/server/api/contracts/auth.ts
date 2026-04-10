import { RegisterBodySchema } from '@/schemas/auth';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const LogoutResponseSchema = z.object({
  logoutUrl: z.string(),
});

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
    logout: {
      method: 'POST',
      path: '/logout',
      body: c.noBody(),
      metadata: {
        auth: 'public',
      } satisfies TsRestMetaData,
      responses: {
        200: LogoutResponseSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/auth' }
);
