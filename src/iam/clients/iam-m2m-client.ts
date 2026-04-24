import { env } from '@/env';

// ============================================
// TYPES
// ============================================

type M2MTokenResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

export type CreateIamUserBody = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isAdmin: boolean;
  isEmployee: boolean;
  status: 'active' | 'suspended';
};

export type IamUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  isAdmin: boolean;
  isEmployee: boolean;
  createdAt: string;
  updatedAt: string;
};

export class IamClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'IamClientError';
  }
}

// ============================================
// TOKEN CACHE
// ============================================

let tokenCache: CachedToken | null = null;
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

// ============================================
// IAM M2M CLIENT
// ============================================

class IamM2MClient {
  private baseUrl: string;
  private tokenUrl: string;
  private clientId: string;
  private clientSecret: string;
  private appSlug: string;

  constructor() {
    this.baseUrl = env.IAM_BASE_URL;
    this.tokenUrl = env.IAM_TOKEN_URL;
    this.clientId = env.IAM_M2M_CLIENT_ID;
    this.clientSecret = env.IAM_M2M_CLIENT_SECRET;
    this.appSlug = env.IAM_SLUG;
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  private isTokenValid(): boolean {
    if (!tokenCache) return false;
    return Date.now() < tokenCache.expiresAt - TOKEN_REFRESH_MARGIN_MS;
  }

  private async fetchNewToken(): Promise<string> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        app_slug: this.appSlug,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      console.error('[IamM2MClient] Token fetch failed:', errorBody);
      throw new IamClientError('Failed to obtain M2M token', response.status, 'TOKEN_FETCH_FAILED');
    }

    const data = (await response.json()) as M2MTokenResponse;

    tokenCache = {
      accessToken: data.accessToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
    };

    return data.accessToken;
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return tokenCache!.accessToken;
    }
    return this.fetchNewToken();
  }

  // ============================================
  // HTTP HELPERS
  // ============================================

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
      body?: unknown;
    }
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
      },
      ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new IamClientError(
        errorBody?.message ?? `IAM request failed: ${response.status}`,
        response.status,
        errorBody?.code,
        errorBody?.details
      );
    }

    // Read body as text first; return undefined if empty (204 No Content or empty 200)
    const text = await response.text();
    if (!text) return undefined as T;

    return JSON.parse(text) as T;
  }

  // ============================================
  // USERS
  // ============================================

  /**
   * Create a user in IAM.
   * Used during registration flow.
   */
  async createUser(data: CreateIamUserBody): Promise<IamUser> {
    return this.request<IamUser>('POST', '/api/v1/users', { body: data });
  }

  /**
   * Get a user by ID from IAM.
   */
  async getUserById(id: string): Promise<IamUser> {
    return this.request<IamUser>('GET', `/api/v1/users/${id}`);
  }

  /**
   * Delete a user by ID from IAM.
   * Used during account deletion flow.
   */
  async deleteUser(id: string): Promise<void> {
    await this.request<void>('DELETE', `/api/v1/users/${id}`);
  }

  /**
   * Verify a user's current password via M2M.
   * Returns true if correct, false if wrong (401 from IAM).
   */
  async verifyUserPassword(id: string, password: string): Promise<boolean> {
    try {
      await this.request<void>('POST', `/api/v1/users/${id}/verify-password`, {
        body: { password },
      });
      return true;
    } catch (e) {
      if (e instanceof IamClientError && e.status === 401) return false;
      throw e;
    }
  }

  /**
   * Set a user's password via M2M.
   * Used for change-password flow — IAM user token does not have permission
   * to call this endpoint; only M2M (admin) credentials work.
   */
  async setUserPassword(id: string, password: string): Promise<void> {
    await this.request<void>('POST', `/api/v1/users/${id}/set-password`, {
      body: { password },
    });
  }

  /**
   * Issue an access + refresh token pair for a user via M2M.
   * Used after registration to auto-login the user without the OAuth flow.
   * Passes the app's own clientId so the IAM signs with the correct JWT secret.
   */
  async createUserToken(id: string): Promise<{
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  }> {
    return this.request('POST', `/api/v1/users/${id}/token`, {
      body: { clientId: env.IAM_CLIENT_ID },
    });
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const iamClient = new IamM2MClient();
