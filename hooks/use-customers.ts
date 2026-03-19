import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createCustomer,
  type CreateCustomerInput,
} from "@/services/customers";
import { useAppStore } from "@/stores/app-store";

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerInput) => createCustomer(payload),
    onSuccess: async () => {
      useAppStore.getState().setLastError(null);
      await queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
