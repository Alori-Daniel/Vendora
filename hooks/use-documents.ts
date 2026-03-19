import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRevenueCatCustomerInfoQuery } from "@/hooks/use-revenuecat";
import { getRevenueCatSupport, hasActiveRevenueCatEntitlement } from "@/lib/revenuecat";
import {
  FREE_DOCUMENT_GENERATION_LIMIT,
  generateAndStoreDocument,
  getDocumentGenerationSummary,
  type GenerateDocumentInput,
} from "@/services/documents";
import { useAppStore } from "@/stores/app-store";

export const documentGenerationSummaryQueryKey = (businessProfileId?: string) =>
  ["documents", "generation-summary", businessProfileId ?? "none"] as const;

export function useDocumentGenerationAccess() {
  const businessProfileId = useAppStore((state) => state.businessProfile?.id);
  const session = useAppStore((state) => state.session);
  const revenueCatSupport = getRevenueCatSupport();
  const summaryQuery = useQuery({
    queryKey: documentGenerationSummaryQueryKey(businessProfileId),
    queryFn: () => getDocumentGenerationSummary(businessProfileId!),
    enabled: Boolean(businessProfileId),
  });
  const customerInfoQuery = useRevenueCatCustomerInfoQuery(session?.user.id);
  const hasActiveSubscription = hasActiveRevenueCatEntitlement(
    customerInfoQuery.data,
  );
  const freeRemaining = summaryQuery.data?.freeRemaining ?? FREE_DOCUMENT_GENERATION_LIMIT;
  const freeUsed = summaryQuery.data?.freeUsed ?? 0;

  return {
    ...summaryQuery,
    hasActiveSubscription,
    isBillingPending: revenueCatSupport.supported && customerInfoQuery.isPending,
    freeLimit: FREE_DOCUMENT_GENERATION_LIMIT,
    freeUsed,
    freeRemaining,
    canGenerate: hasActiveSubscription || freeRemaining > 0,
    usageMessage: hasActiveSubscription
      ? "Subscription active. Invoice and receipt exports are unlimited."
      : `${freeRemaining} of ${FREE_DOCUMENT_GENERATION_LIMIT} free document generations remaining.`,
  };
}

export function useGenerateDocumentMutation() {
  const queryClient = useQueryClient();
  const businessProfileId = useAppStore((state) => state.businessProfile?.id);

  return useMutation({
    mutationFn: (payload: GenerateDocumentInput) => generateAndStoreDocument(payload),
    onSuccess: async () => {
      useAppStore.getState().setLastError(null);
      await queryClient.invalidateQueries({
        queryKey: documentGenerationSummaryQueryKey(businessProfileId),
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
