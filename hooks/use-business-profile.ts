import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchBusinessProfile,
  type UpsertBusinessProfileInput,
  upsertBusinessProfile,
} from "@/services/business-profile";
import { useAppStore } from "@/stores/app-store";
import type { BusinessProfileRow } from "@/types/supabase";

export const businessProfileQueryKey = (userId?: string) =>
  ["business-profile", userId ?? "anonymous"] as const;

export function useBusinessProfileQuery(userId?: string) {
  return useQuery({
    queryKey: businessProfileQueryKey(userId),
    queryFn: () => fetchBusinessProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useUpsertBusinessProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertBusinessProfileInput) =>
      upsertBusinessProfile(payload),
    onSuccess: (profile: BusinessProfileRow) => {
      queryClient.setQueryData(businessProfileQueryKey(profile.user_id), profile);
      useAppStore.getState().setBusinessProfile(profile);
      useAppStore.getState().setLastError(null);
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
