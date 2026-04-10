import { DashboardAnalytics, DashboardQuerySchema } from '@/schemas/analytics';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const analytics = c.router(
  {
    dashboard: {
      method: 'GET',
      path: '/dashboard',
      query: DashboardQuerySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<DashboardAnalytics>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/analytics' }
);
