import { z } from 'zod';

// ============================================
// MUTATIONS
// ============================================

export const UpdateUserSettingsBodySchema = z.object({
  emailOnBrokenLink: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  digestDay: z
    .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .optional(),
  ccEmail: z.string().email().nullable().optional(),
});
