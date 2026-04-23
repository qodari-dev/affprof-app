import { db, users } from '@/server/db';
import { genericTsRestErrorResponse } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { iamClient } from '@/iam/clients/iam-m2m-client';
import { tsr } from '@ts-rest/serverless/next';
import { eq, and, ne } from 'drizzle-orm';
import { contract } from '../contracts';
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
      const auth = await getAuthContext(request);

      // Verify current password via IAM M2M before allowing the change.
      const isCurrentPasswordValid = await iamClient.verifyUserPassword(auth.userId, body.currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          status: 400 as const,
          body: { message: 'Current password is incorrect' },
        };
      }

      // IAM's set-password endpoint requires M2M (admin) credentials.
      await iamClient.setUserPassword(auth.userId, body.newPassword);

      return { status: 204 as const, body: undefined };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error changing password',
      });
    }
  },
});
