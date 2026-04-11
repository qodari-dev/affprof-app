import { type NextRequest } from 'next/server';

import { handleDefaultShortLinkRedirect } from '@/server/services/link-redirect';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/go/[userSlug]/[linkSlug]'>,
) {
  const { userSlug, linkSlug } = await ctx.params;

  return handleDefaultShortLinkRedirect(request, { userSlug, linkSlug });
}
