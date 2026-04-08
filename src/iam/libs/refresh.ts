import { NextRequest, NextResponse } from 'next/server';

export type IamRefreshConfig = {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  refreshTokenMaxAgeSeconds?: number;
};

type RefreshTokenRequestBody = {
  grant_type: 'refresh_token';
  refresh_token: string;
  client_id: string;
  client_secret: string;
};

type TokenEndpointResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope?: string;
};

type RefreshSuccessResponse = {
  success: true;
  expiresIn: number;
};

type RefreshErrorResponse = {
  success: false;
  error: string;
};

export function createIamRefreshHandler(config: IamRefreshConfig) {
  const secure = process.env.NODE_ENV === 'production';
  const defaultRefreshMaxAge = config.refreshTokenMaxAgeSeconds ?? 60 * 60 * 24 * 15;

  return async function iamRefreshHandler(req: NextRequest): Promise<NextResponse> {
    const refreshCookie = req.cookies.get(config.refreshTokenCookieName)?.value;

    // 1) No refresh token → can't refresh
    if (!refreshCookie) {
      const resBody: RefreshErrorResponse = {
        success: false,
        error: 'Missing refresh token',
      };
      const resp = NextResponse.json(resBody, { status: 401 });
      resp.cookies.set(config.accessTokenCookieName, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return resp;
    }

    // 2) Exchange refresh token
    const body: RefreshTokenRequestBody = {
      grant_type: 'refresh_token',
      refresh_token: refreshCookie,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    };

    const tokenRes = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!tokenRes.ok) {
      let errorBody: unknown;
      try {
        errorBody = await tokenRes.json();
      } catch {
        errorBody = null;
      }
      console.error('[iam-refresh] token error', errorBody);

      const respBody: RefreshErrorResponse = {
        success: false,
        error: 'Failed to refresh token',
      };
      const resp = NextResponse.json(respBody, { status: 401 });

      resp.cookies.set(config.accessTokenCookieName, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      resp.cookies.set(config.refreshTokenCookieName, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return resp;
    }

    const json = (await tokenRes.json()) as TokenEndpointResponse;

    const respBody: RefreshSuccessResponse = {
      success: true,
      expiresIn: json.expiresIn,
    };

    const resp = NextResponse.json(respBody, { status: 200 });

    // 3) Update access token cookie
    resp.cookies.set(config.accessTokenCookieName, json.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: json.expiresIn,
    });

    // 4) Rotate refresh token if IAM returned a new one
    if (json.refreshToken) {
      resp.cookies.set(config.refreshTokenCookieName, json.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: defaultRefreshMaxAge,
      });
    }

    return resp;
  };
}
