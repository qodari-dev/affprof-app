'use client';

import { api } from '@/clients/api';
import { useApiError } from '@/hooks/use-api-error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const userSettingsKeys = {
  all: ['user-settings'] as const,
  detail: () => [...userSettingsKeys.all, 'detail'] as const,
};

export function useUserSettings(options?: { enabled?: boolean }) {
  return api.userSettings.get.useQuery({
    queryKey: userSettingsKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateUserSettings() {
  const queryClient = api.useQueryClient();
  const getErrorMessage = useApiError();
  const t = useTranslations('toasts');

  return api.userSettings.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.all });
    },
    onError: (error) => {
      toast.error(t('settingsUpdateError'), { description: getErrorMessage(error) });
    },
  });
}
