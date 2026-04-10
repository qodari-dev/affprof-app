import { initContract } from '@ts-rest/core';
import { analytics } from './analytics';
import { auth } from './auth';
import { billing } from './billing';
import { profile } from './profile';
import { product } from './product';
import { link } from './link';
import { tag } from './tag';
import { userSettings } from './user-settings';
import { webhook } from './webhook';

const c = initContract();

export const contract = c.router(
  {
    analytics,
    auth,
    billing,
    profile,
    product,
    link,
    tag,
    userSettings,
    webhook,
  },
  {
    pathPrefix: '/api/v1',
  }
);

export type Contract = typeof contract;
