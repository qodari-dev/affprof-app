import { cookies } from 'next/headers';

import { env } from '@/env';

/**
 * Clears the access and refresh token cookies.
 * Used in both logout and account deletion flows.
 */
export async function clearAuthCookies() {
  const secure = env.NODE_ENV === 'production';
  const cookieStore = await cookies();

  cookieStore.set(env.ACCESS_TOKEN_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  cookieStore.set(env.REFRESH_TOKEN_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
