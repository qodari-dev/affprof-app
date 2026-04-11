import { type NextRequest } from 'next/server';

import { handleCustomDomainRedirect } from '@/server/services/link-redirect';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/[linkSlug]'>,
) {
  const { linkSlug } = await ctx.params;

  return handleCustomDomainRedirect(request, { linkSlug });
}
