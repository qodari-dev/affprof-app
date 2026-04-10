'use client';

import { api } from '@/clients/api';
import type { DashboardQuery } from '@/schemas/analytics';

// ============================================================================
// Query Keys
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (filters: Partial<DashboardQuery> = {}) =>
    [...analyticsKeys.all, 'dashboard', filters] as const,
};

// ============================================================================
// DASHBOARD
// ============================================================================

export function useDashboardAnalytics(filters: Partial<DashboardQuery> = {}) {
  return api.analytics.dashboard.useQuery({
    queryKey: analyticsKeys.dashboard(filters),
    queryData: { query: filters as DashboardQuery },
  });
}
