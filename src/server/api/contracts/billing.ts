import { CreateCheckoutBodySchema } from '@/schemas/billing';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const billing = c.router(
  {
    createCheckout: {
      method: 'POST',
      path: '/create-checkout',
      body: CreateCheckoutBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<{ checkoutUrl: string }>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    createPortal: {
      method: 'POST',
      path: '/create-portal',
      body: c.noBody(),
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<{ portalUrl: string }>(),
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/billing' }
);
