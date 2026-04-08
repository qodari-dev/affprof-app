import type { NextRequest } from 'next/server';
import { throwHttpError } from './generic-ts-rest-error';
import { TsRestRequest } from '@ts-rest/serverless/next';
import { AuthContext } from '@/iam/utils/get-auth-context';
import { env } from '@/env';
import { AccessTokenPayload, verifyAccessToken } from '@/iam/utils/verify-access-token';

export type { AuthContext };

/**
 * Get Auth Context from a token string.
 * Verifies JWT and returns user info.
 */
async function getAuthContextFromToken(token: string): Promise<AuthContext> {
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throwHttpError({
      status: 401,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN',
    });
  }

  let verifiedPayload: AccessTokenPayload;
  try {
    verifiedPayload = await verifyAccessToken(token, env.IAM_JWT_SECRET);
  } catch (error) {
    throwHttpError({
      status: 401,
      message: error instanceof Error ? error.message : 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (!verifiedPayload.user) {
    throwHttpError({
      status: 401,
      message: 'Invalid token: missing user info',
      code: 'INVALID_TOKEN',
    });
  }

  return {
    ...verifiedPayload,
    userId: verifiedPayload.sub,
  };
}

/**
 * Get auth context from request.
 * Supports Bearer token (API) and Cookie (browser).
 * Priority: Bearer token > Cookie
 */
export async function getAuthContext(
  request: NextRequest | TsRestRequest
): Promise<AuthContext> {
  // Try Bearer token first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return getAuthContextFromToken(token);
  }

  // Fallback to cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    const token = cookies[env.ACCESS_TOKEN_NAME];
    if (token) {
      return getAuthContextFromToken(token);
    }
  }

  throwHttpError({
    status: 401,
    message: 'Not authenticated',
    code: 'UNAUTHENTICATED',
  });
}
