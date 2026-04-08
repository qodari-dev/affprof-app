import { contract } from '@/server/api/contracts';
import { createNextHandler } from '@ts-rest/serverless/next';
import { auth } from './auth';
import { billing } from './billing';
import { product } from './product';
import { link } from './link';
import { tag } from './tag';
import { userSettingsHandler } from './user-settings';
import { webhook } from './webhook';

export const handler = createNextHandler(
  contract,
  {
    auth,
    billing,
    product,
    link,
    tag,
    userSettings: userSettingsHandler,
    webhook,
  },
  {
    handlerType: 'app-router',
    jsonQuery: true,
    responseValidation: false,
  }
);
