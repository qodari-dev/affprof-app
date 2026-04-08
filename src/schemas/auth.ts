import { z } from 'zod';

// ============================================
// REGISTER
// ============================================

export const RegisterBodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(45),
  lastName: z.string().min(1).max(45),
  password: z.string().min(8).max(128),
  plan: z.enum(['free', 'pro', 'pro_annual']).default('free'),
});

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export const RegisterResponseSchema = z.object({
  userId: z.string(),
  plan: z.string(),
  checkoutUrl: z.string().nullable(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
