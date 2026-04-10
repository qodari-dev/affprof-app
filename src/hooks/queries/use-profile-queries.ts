import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';

// ============================================
// QUERY KEYS
// ============================================

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ============================================
// QUERIES
// ============================================

export function useProfile(options?: { enabled?: boolean }) {
  return api.profile.get.useQuery({
    queryKey: profileKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useUpdateProfile() {
  const queryClient = api.useQueryClient();

  return api.profile.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      toast.error('Error updating profile', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useChangePassword() {
  return api.profile.changePassword.useMutation({
    onError: (error) => {
      toast.error('Error changing password', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
