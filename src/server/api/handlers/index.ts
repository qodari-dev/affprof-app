import { contract } from '@/server/api/contracts';
import { createNextHandler } from '@ts-rest/serverless/next';
import { analytics } from './analytics';
import { auth } from './auth';
import { brandHandler } from './brand';
import { billing } from './billing';
import { customDomainHandler } from './custom-domain';
import { profileHandler } from './profile';
import { product } from './product';
import { link } from './link';
import { storageHandler } from './storage';
import { tag } from './tag';
import { userSettingsHandler } from './user-settings';

export const handler = createNextHandler(
  contract,
  {
    analytics,
    auth,
    brand: brandHandler,
    billing,
    customDomain: customDomainHandler,
    profile: profileHandler,
    product,
    link,
    storage: storageHandler,
    tag,
    userSettings: userSettingsHandler,
  },
  {
    handlerType: 'app-router',
    jsonQuery: true,
    responseValidation: false,
  }
);
