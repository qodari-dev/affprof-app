import { db, userSettings } from '@/server/db';
import { genericTsRestErrorResponse } from '@/server/utils/generic-ts-rest-error';
import { getAuthContext } from '@/server/utils/auth-context';
import { tsr } from '@ts-rest/serverless/next';
import { eq } from 'drizzle-orm';
import { contract } from '../contracts';

// ============================================
// HANDLER
// ============================================

export const userSettingsHandler = tsr.router(contract.userSettings, {
  // ==========================================
  // GET - GET /settings
  // ==========================================
  get: async (_args, { request }) => {
    try {
      const auth = await getAuthContext(request);

      let settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, auth.userId),
      });

      // Auto-create default settings if none exist
      if (!settings) {
        const [created] = await db
          .insert(userSettings)
          .values({ userId: auth.userId })
          .returning();
        settings = created;
      }

      return { status: 200, body: settings };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error fetching settings',
      });
    }
  },

  // ==========================================
  // UPDATE - PATCH /settings
  // ==========================================
  update: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      // Upsert: create if not exists, update if exists
      const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, auth.userId),
      });

      let settings;
      if (existing) {
        const [updated] = await db
          .update(userSettings)
          .set(body)
          .where(eq(userSettings.userId, auth.userId))
          .returning();
        settings = updated;
      } else {
        const [created] = await db
          .insert(userSettings)
          .values({ ...body, userId: auth.userId })
          .returning();
        settings = created;
      }

      return { status: 200, body: settings };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error updating settings',
      });
    }
  },
});
