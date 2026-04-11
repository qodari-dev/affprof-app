import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';

export const customDomainKeys = {
  all: ['custom-domains'] as const,
  list: () => [...customDomainKeys.all, 'list'] as const,
};

export function useCustomDomains(options?: { enabled?: boolean }) {
  return api.customDomain.list.useQuery({
    queryKey: customDomainKeys.list(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCustomDomain() {
  const queryClient = api.useQueryClient();

  return api.customDomain.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error('Error adding custom domain', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useVerifyCustomDomain() {
  const queryClient = api.useQueryClient();

  return api.customDomain.verify.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error('Error verifying custom domain', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useSetPrimaryCustomDomain() {
  const queryClient = api.useQueryClient();

  return api.customDomain.setPrimary.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error('Error setting primary domain', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useDeleteCustomDomain() {
  const queryClient = api.useQueryClient();

  return api.customDomain.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
    },
    onError: (error) => {
      toast.error('Error deleting custom domain', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function getPrimaryVerifiedCustomDomainHostname(
  domains:
    | Array<{ hostname: string; isPrimary: boolean; status: 'pending' | 'verified' }>
    | undefined,
) {
  return domains?.find((domain) => domain.status === 'verified' && domain.isPrimary)?.hostname ?? null;
}
