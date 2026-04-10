import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { contract } from '@/server/api/contracts';
import { env } from '@/env';
import { tsRestFetchApi } from '@ts-rest/core';

const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';

/**
 * Gets the access token from cookies (server-side only).
 * On client-side, cookies are sent automatically via credentials: 'include'.
 */
const getServerAccessToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    return null;
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
};

/**
 * Attempts to refresh the access token using the refresh token cookie.
 * Only works on client-side.
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Redirects to home page which will trigger IAM login via proxy.
 */
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const api = initTsrReactQuery(contract, {
  baseUrl: env.NEXT_PUBLIC_API_URL,
  baseHeaders: {
    'x-app-source': 'ts-rest',
  },
  jsonQuery: true,
  credentials: 'include',
  api: async ({ headers, ...args }) => {
    const token = await getServerAccessToken();

    const makeRequest = () =>
      tsRestFetchApi({
        ...args,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

    const response = await makeRequest();

    // On client-side, handle 401 with auto-refresh
    if (typeof window !== 'undefined' && response.status === 401) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return makeRequest();
      } else {
        redirectToLogin();
      }
    }

    return response;
  },
});
