import { z } from 'zod';

// ============================================
// CHECKOUT
// ============================================

export const CreateCheckoutBodySchema = z.object({
  plan: z.enum(['pro', 'pro_annual']),
});

export type CreateCheckoutBody = z.infer<typeof CreateCheckoutBodySchema>;

export const CheckoutResponseSchema = z.object({
  checkoutUrl: z.string(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

// ============================================
// PORTAL
// ============================================

export const PortalResponseSchema = z.object({
  portalUrl: z.string(),
});

export type PortalResponse = z.infer<typeof PortalResponseSchema>;
