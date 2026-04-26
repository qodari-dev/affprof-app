import { NextRequest, NextResponse } from 'next/server';
import { createIamProxy } from '@/iam/libs/proxy';
import { env } from '@/env';
import { LOCALE_COOKIE, defaultLocale, locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

const iamProxy = createIamProxy({
  iamBaseUrl: env.IAM_BASE_URL,
  clientId: env.IAM_CLIENT_ID,
  redirectUri: env.IAM_REDIRECT_URI,
  accessTokenCookieName: env.ACCESS_TOKEN_NAME,
  publicPaths: ['/oauth/callback', '/register', '/billing/success', '/billing/canceled', '/go', '/link-unavailable'],
});

const appHostname = new URL(env.NEXT_PUBLIC_APP_URL).hostname;

export default async function proxy(request: NextRequest) {
  // 1) Custom-domain requests are public redirect routes — skip auth entirely.
  //    Only requests arriving on the app's own hostname need authentication.
  if (request.nextUrl.hostname !== appHostname) {
    const response = NextResponse.next();

    if (!request.cookies.get(LOCALE_COOKIE)?.value) {
      const acceptLang = request.headers.get('accept-language') ?? '';
      const preferred = acceptLang.split(',')[0]?.split('-')[0]?.trim() as Locale;
      const locale = locales.includes(preferred) ? preferred : defaultLocale;
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  }

  // 2) Run IAM proxy first (auth check)
  const response = await iamProxy(request);

  // 3) Ensure locale cookie is set (for next-intl)
  if (!request.cookies.get(LOCALE_COOKIE)?.value) {
    // Detect from Accept-Language header, fallback to defaultLocale
    const acceptLang = request.headers.get('accept-language') ?? '';
    const preferred = acceptLang.split(',')[0]?.split('-')[0]?.trim() as Locale;
    const locale = locales.includes(preferred) ? preferred : defaultLocale;

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|public|monitoring).*)'],
};
