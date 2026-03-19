import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";

import {
  getRevenueCatCustomerInfo,
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from "@/lib/revenuecat";
import { useAppStore } from "@/stores/app-store";

export function useRevenueCatOfferingsQuery() {
  return useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: getRevenueCatOfferings,
    staleTime: 5 * 60_000,
  });
}

export function useRevenueCatCustomerInfoQuery(userId?: string) {
  return useQuery({
    queryKey: ["revenuecat", "customer-info", userId ?? "anonymous"],
    queryFn: getRevenueCatCustomerInfo,
    enabled: Boolean(userId),
  });
}

export function useRestoreRevenueCatPurchasesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreRevenueCatPurchases,
    onSuccess: async () => {
      useAppStore.getState().setLastError(null);
      await queryClient.invalidateQueries({
        queryKey: ["revenuecat"],
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}

export function usePurchaseRevenueCatPackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aPackage: PurchasesPackage) => purchaseRevenueCatPackage(aPackage),
    onSuccess: async () => {
      useAppStore.getState().setLastError(null);
      await queryClient.invalidateQueries({
        queryKey: ["revenuecat"],
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
