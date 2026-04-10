import { z } from 'zod';

// ============================================
// MUTATIONS
// ============================================

export const UpdateProfileBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  timezone: z.string().min(1).max(100).optional(),
});

export const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});
