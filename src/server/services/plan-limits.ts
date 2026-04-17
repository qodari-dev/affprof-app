import { db, subscriptions, links, products } from '@/server/db';
import { and, count, eq, isNull } from 'drizzle-orm';
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

export async function enforceLinkLimit(userId: string) {
  const plan = await getUserPlan(userId);
  if (plan !== 'free') return;

  const [row] = await db
    .select({ total: count() })
    .from(links)
    .where(and(eq(links.userId, userId), isNull(links.deletedAt)));

  if ((row?.total ?? 0) >= FREE_LIMITS.links) {
    throwHttpError({
      status: 403,
      message: `Free plan supports up to ${FREE_LIMITS.links} links. Upgrade to Pro for unlimited.`,
      code: 'FORBIDDEN',
    });
  }
}

export async function enforceProductLimit(userId: string) {
  const plan = await getUserPlan(userId);
  if (plan !== 'free') return;

  const [row] = await db
    .select({ total: count() })
    .from(products)
    .where(and(eq(products.userId, userId), isNull(products.deletedAt)));

  if ((row?.total ?? 0) >= FREE_LIMITS.products) {
    throwHttpError({
      status: 403,
      message: `Free plan supports up to ${FREE_LIMITS.products} products. Upgrade to Pro for unlimited.`,
      code: 'FORBIDDEN',
    });
  }
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
