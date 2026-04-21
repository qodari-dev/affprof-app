'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

export function useProfile(options?: { enabled?: boolean }) {
  return api.profile.get.useQuery({
    queryKey: profileKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateProfile() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.profile.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      toast.error(t('profileUpdateError'), { description: getErrorMessage(error) });
    },
  });
}

export function useChangePassword() {
  return api.profile.changePassword.useMutation();
}
