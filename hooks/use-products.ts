import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProduct, fetchProducts, type CreateProductInput } from "@/services/products";
import { useAppStore } from "@/stores/app-store";

export const productsQueryKey = (businessProfileId?: string) =>
  ["products", businessProfileId ?? "none"] as const;

export function useProductsQuery() {
  const businessProfileId = useAppStore((state) => state.businessProfile?.id);

  return useQuery({
    queryKey: productsQueryKey(businessProfileId),
    queryFn: () => fetchProducts(businessProfileId!),
    enabled: Boolean(businessProfileId),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const businessProfileId = useAppStore((state) => state.businessProfile?.id);

  return useMutation({
    mutationFn: (payload: CreateProductInput) => createProduct(payload),
    onSuccess: async () => {
      useAppStore.getState().setLastError(null);
      await queryClient.invalidateQueries({
        queryKey: productsQueryKey(businessProfileId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
