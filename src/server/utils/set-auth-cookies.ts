import { cookies } from 'next/headers';

import { env } from '@/env';

/**
 * Sets the access and refresh token cookies.
 * Used after registration to auto-login the user without the OAuth redirect flow.
 */
export async function setAuthCookies({
  accessToken,
  refreshToken,
  expiresIn,
}: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}) {
  const secure = env.NODE_ENV === 'production';
  const cookieStore = await cookies();

  cookieStore.set(env.ACCESS_TOKEN_NAME, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });

  cookieStore.set(env.REFRESH_TOKEN_NAME, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 15, // 15 days, same as the callback handler
  });
}
