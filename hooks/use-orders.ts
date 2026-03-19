import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createOrderWithItemsAndInvoice,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  updateOrderStatus,
} from "@/services/orders";
import { useAppStore } from "@/stores/app-store";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderInput) =>
      createOrderWithItemsAndInvoice(payload),
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

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderStatusInput) => updateOrderStatus(payload),
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
