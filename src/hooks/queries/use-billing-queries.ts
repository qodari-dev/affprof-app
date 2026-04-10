import { api } from '@/clients/api';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';
import { toast } from 'sonner';

export const billingKeys = {
  all: ['billing'] as const,
  detail: () => [...billingKeys.all, 'detail'] as const,
  history: () => [...billingKeys.all, 'history'] as const,
};

export function useBilling(options?: { enabled?: boolean }) {
  return api.billing.get.useQuery({
    queryKey: billingKeys.detail(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useBillingHistory(options?: { enabled?: boolean }) {
  return api.billing.history.useQuery({
    queryKey: billingKeys.history(),
    queryData: {},
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCheckout() {
  return api.billing.createCheckout.useMutation({
    onError: (error) => {
      toast.error('Error creating checkout session', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}

export function useCreatePortal() {
  return api.billing.createPortal.useMutation({
    onError: (error) => {
      toast.error('Error opening billing portal', {
        description: getTsRestErrorMessage(error),
      });
    },
  });
}
