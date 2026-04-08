import { z } from 'zod';

// ============================================
// PARAMS
// ============================================

export const UUIDParamSchema = z.object({
  id: z.string().uuid(),
});

export type UUIDParam = z.infer<typeof UUIDParamSchema>;
