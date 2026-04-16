import { NextRequest } from 'next/server';
import { createIamProxy } from '@/iam/libs/proxy';
import { env } from '@/env';
import { LOCALE_COOKIE, defaultLocale, locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

const iamProxy = createIamProxy({
  iamBaseUrl: env.IAM_BASE_URL,
  clientId: env.IAM_CLIENT_ID,
  redirectUri: env.IAM_REDIRECT_URI,
  accessTokenCookieName: env.ACCESS_TOKEN_NAME,
  publicPaths: ['/oauth/callback', '/register','/billing/success','/billing/canceled'],
});

export default async function proxy(request: NextRequest) {
  // 1) Run IAM proxy first (auth check)
  const response = await iamProxy(request);

  // 2) Ensure locale cookie is set (for next-intl)
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
  matcher: ['/((?!_next|api|favicon.ico|public).*)'],
};
