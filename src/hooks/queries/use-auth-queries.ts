'use client';

import { api } from '@/clients/api';

// ============================================================================
// REGISTER
// ============================================================================

/**
 * Register a new account.
 * Caller is responsible for handling the response:
 *  - status 201 + body.checkoutUrl  → redirect to Stripe (paid plan)
 *  - status 201 + checkoutUrl null  → redirect to '/' so the proxy hands off
 *                                     to IAM for first login
 *  - status 4xx                     → surface body.message / body.code
 *
 * Toasts are not raised here so the page can drive its own UX.
 */
export function useRegister() {
  return api.auth.register.useMutation();
}

// ============================================================================
// LOGOUT
// ============================================================================

export function useLogout() {
  return api.auth.logout.useMutation();
}
