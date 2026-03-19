import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getMissingSupabaseConfigMessage, hasSupabaseConfig } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase";
import { businessProfileQueryKey } from "@/hooks/use-business-profile";
import { useAppStore } from "@/stores/app-store";

type SignInInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: SignInInput) => {
      if (!hasSupabaseConfig) {
        throw new Error(getMissingSupabaseConfigMessage());
      }

      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async (result) => {
      useAppStore.getState().setAuthResolved(result.session ?? null);
      useAppStore.getState().setLastError(null);

      if (result.session?.user.id) {
        await queryClient.invalidateQueries({
          queryKey: businessProfileQueryKey(result.session.user.id),
        });
      }
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async ({ fullName, email, password }: SignUpInput) => {
      if (!hasSupabaseConfig) {
        throw new Error(getMissingSupabaseConfigMessage());
      }

      const { data, error } = await getSupabaseClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (result) => {
      useAppStore.getState().setAuthResolved(result.session ?? null);
      useAppStore.getState().setLastError(null);
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!hasSupabaseConfig) {
        return;
      }

      const { error } = await getSupabaseClient().auth.signOut();

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      useAppStore.getState().reset();
      await queryClient.removeQueries({
        queryKey: ["business-profile"],
      });
      await queryClient.removeQueries({
        queryKey: ["workspace"],
      });
      await queryClient.removeQueries({
        queryKey: ["revenuecat"],
      });
      await queryClient.removeQueries({
        queryKey: ["documents"],
      });
    },
    onError: (error: Error) => {
      useAppStore.getState().setLastError(error.message);
    },
  });
}
