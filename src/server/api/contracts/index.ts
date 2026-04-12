import { initContract } from '@ts-rest/core';
import { analytics } from './analytics';
import { auth } from './auth';
import { brand } from './brand';
import { billing } from './billing';
import { customDomain } from './custom-domain';
import { profile } from './profile';
import { product } from './product';
import { link } from './link';
import { tag } from './tag';
import { userSettings } from './user-settings';

const c = initContract();

export const contract = c.router(
  {
    analytics,
    auth,
    brand,
    billing,
    customDomain,
    profile,
    product,
    link,
    tag,
    userSettings,
  },
  {
    pathPrefix: '/api/v1',
  }
);

export type Contract = typeof contract;
