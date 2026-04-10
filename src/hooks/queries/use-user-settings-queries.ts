import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';

// ============================================
// QUERY KEYS
// ============================================

export const userSettingsKeys = {
  all: ['user-settings'] as const,
  detail: () => [...userSettingsKeys.all, 'detail'] as const,
};

// ============================================
// QUERIES
// ============================================

export function useUserSettings(options?: { enabled?: boolean }) {
  return api.userSettings.get.useQuery({
    queryKey: userSettingsKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useUpdateUserSettings() {
  const queryClient = api.useQueryClient();

  return api.userSettings.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.all });
    },
    onError: (error) => {
      toast.error('Error updating settings', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
