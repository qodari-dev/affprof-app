import { db, users } from '@/server/db';
import { genericTsRestErrorResponse } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { eq, and, ne } from 'drizzle-orm';
import { contract } from '../contracts';
import { env } from '@/env';

// ============================================
// HANDLER
// ============================================

export const profileHandler = tsr.router(contract.profile, {
  // ==========================================
  // GET - GET /profile
  // ==========================================
  get: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      const user = await db.query.users.findFirst({
        where: eq(users.id, auth.userId),
      });

      if (!user) {
        return {
          status: 404 as const,
          body: { message: 'User not found' },
        };
      }

      return { status: 200 as const, body: user };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error fetching profile',
      });
    }
  },

  // ==========================================
  // UPDATE - PATCH /profile
  // ==========================================
  update: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      // If slug is being changed, check uniqueness
      if (body.slug) {
        const existingSlug = await db.query.users.findFirst({
          where: and(eq(users.slug, body.slug), ne(users.id, auth.userId)),
        });

        if (existingSlug) {
          return {
            status: 409 as const,
            body: { message: 'This slug is already taken. Please choose another one.' },
          };
        }
      }

      const [updated] = await db
        .update(users)
        .set(body)
        .where(eq(users.id, auth.userId))
        .returning();

      if (!updated) {
        return {
          status: 404 as const,
          body: { message: 'User not found' },
        };
      }

      return { status: 200 as const, body: updated };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error updating profile',
      });
    }
  },

  // ==========================================
  // CHANGE PASSWORD - POST /profile/change-password
  // ==========================================
  changePassword: async ({ body }, { request }) => {
    try {
      await getAuthContext(request);

      // Proxy to IAM's change-password endpoint using the user's own token
      const accessToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.headers.get('cookie')?.match(new RegExp(`${env.ACCESS_TOKEN_NAME}=([^;]+)`))?.[1];

      if (!accessToken) {
        return {
          status: 401 as const,
          body: { message: 'Not authenticated' },
        };
      }

      const iamResponse = await fetch(`${env.IAM_BASE_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
        }),
      });

      if (!iamResponse.ok) {
        const errorBody = await iamResponse.json().catch(() => null);
        const message = errorBody?.message ?? 'Failed to change password';
        return {
          status: (iamResponse.status === 400 ? 400 : 500) as 400,
          body: { message },
        };
      }

      return { status: 204 as const, body: undefined };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error changing password',
      });
    }
  },
});
