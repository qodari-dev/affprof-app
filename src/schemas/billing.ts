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

// ============================================
// BILLING HISTORY
// ============================================

export const BillingHistoryItemSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().nullable(),
  status: z.string().nullable(),
  currency: z.string(),
  amountPaid: z.number(),
  amountDue: z.number(),
  createdAt: z.string(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  hostedInvoiceUrl: z.string().url().nullable(),
  invoicePdf: z.string().url().nullable(),
});

export const BillingHistoryResponseSchema = z.array(BillingHistoryItemSchema);

export type BillingHistoryItem = z.infer<typeof BillingHistoryItemSchema>;
export type BillingHistoryResponse = z.infer<typeof BillingHistoryResponseSchema>;
