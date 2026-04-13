'use client';

import { api } from '@/clients/api';
import type { DashboardQuery, LinkAnalyticsQuery } from '@/schemas/analytics';

// ============================================================================
// Query Keys
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (filters: Partial<DashboardQuery> = {}) =>
    [...analyticsKeys.all, 'dashboard', filters] as const,
  links: () => [...analyticsKeys.all, 'link'] as const,
  link: (id: string, filters: Partial<LinkAnalyticsQuery> = {}) =>
    [...analyticsKeys.links(), id, filters] as const,
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

// ============================================================================
// LINK ANALYTICS
// ============================================================================

export function useLinkAnalytics(
  linkId: string,
  filters: Partial<LinkAnalyticsQuery> = {},
  options?: { enabled?: boolean }
) {
  return api.analytics.link.useQuery({
    queryKey: analyticsKeys.link(linkId, filters),
    queryData: {
      params: { id: linkId },
      query: filters as LinkAnalyticsQuery,
    },
    enabled: !!linkId && (options?.enabled ?? true),
  });
}
