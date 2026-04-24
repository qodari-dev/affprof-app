import { and, count, eq, isNull } from 'drizzle-orm';

import { db, subscriptions, links, products } from '@/server/db';
import { throwHttpError } from '@/server/utils/generic-ts-rest-error';

const FREE_LIMITS = {
  links: 10,
  products: 2,
};

async function getUserPlan(userId: string) {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    columns: { plan: true },
  });
  return sub?.plan ?? 'free';
}

async function enforceEntityLimit(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  limit: number,
  featureName: string,
) {
  const plan = await getUserPlan(userId);
  if (plan !== 'free') return;

  const [row] = await db
    .select({ total: count() })
    .from(table)
    .where(and(eq(table.userId, userId), isNull(table.deletedAt)));

  if ((row?.total ?? 0) >= limit) {
    throwHttpError({
      status: 403,
      message: `Free plan supports up to ${limit} ${featureName}. Upgrade to Pro for unlimited.`,
      code: 'FORBIDDEN',
    });
  }
}

export async function enforceLinkLimit(userId: string) {
  return enforceEntityLimit(userId, links, FREE_LIMITS.links, 'links');
}

export async function enforceProductLimit(userId: string) {
  return enforceEntityLimit(userId, products, FREE_LIMITS.products, 'products');
}

export async function requireProPlan(userId: string, feature: string) {
  const plan = await getUserPlan(userId);
  if (plan === 'free') {
    throwHttpError({
      status: 403,
      message: `${feature} is available on Pro plans.`,
      code: 'FORBIDDEN',
    });
  }
}
