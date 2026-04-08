import { UpdateUserSettingsBodySchema } from '@/schemas/user-settings';
import { TsRestErrorSchema, TsRestMetaData } from '@/schemas/ts-rest';
import { UserSettings } from '@/server/db';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const userSettings = c.router(
  {
    get: {
      method: 'GET',
      path: '/',
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<UserSettings>(),
        401: TsRestErrorSchema,
        404: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
    update: {
      method: 'PATCH',
      path: '/',
      body: UpdateUserSettingsBodySchema,
      metadata: {
        auth: 'required',
      } satisfies TsRestMetaData,
      responses: {
        200: c.type<UserSettings>(),
        400: TsRestErrorSchema,
        401: TsRestErrorSchema,
        500: TsRestErrorSchema,
      },
    },
  },
  { pathPrefix: '/settings' }
);
