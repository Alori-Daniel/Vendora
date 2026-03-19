import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPayment, type CreatePaymentInput } from "@/services/payments";
import { useAppStore } from "@/stores/app-store";

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentInput) => createPayment(payload),
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
