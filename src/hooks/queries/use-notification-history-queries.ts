import { api } from '@/clients/api';

export const notificationHistoryKeys = {
  all: ['notification-history'] as const,
  list: () => [...notificationHistoryKeys.all, 'list'] as const,
};

export function useNotificationHistory(options?: { enabled?: boolean }) {
  return api.userSettings.history.useQuery({
    queryKey: notificationHistoryKeys.list(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}
