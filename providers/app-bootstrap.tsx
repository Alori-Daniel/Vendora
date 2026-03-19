import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { useBusinessProfileQuery } from "@/hooks/use-business-profile";
import { hasSupabaseConfig } from "@/lib/env";
import { syncRevenueCatIdentity } from "@/lib/revenuecat";
import { getSupabaseClient } from "@/lib/supabase";
import { useAppStore } from "@/stores/app-store";

export function AppBootstrap() {
  const queryClient = useQueryClient();
  const session = useAppStore((state) => state.session);
  const setAuthLoading = useAppStore((state) => state.setAuthLoading);
  const setAuthResolved = useAppStore((state) => state.setAuthResolved);
  const setBusinessProfileLoading = useAppStore(
    (state) => state.setBusinessProfileLoading,
  );
  const setBusinessProfile = useAppStore((state) => state.setBusinessProfile);
  const clearBusinessProfile = useAppStore((state) => state.clearBusinessProfile);
  const setRevenueCatStatus = useAppStore(
    (state) => state.setRevenueCatStatus,
  );
  const setLastError = useAppStore((state) => state.setLastError);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setAuthResolved(null);
      return;
    }

    let isActive = true;
    setAuthLoading();

    void getSupabaseClient()
      .auth.getSession()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          setLastError(error.message);
          setAuthResolved(null);
          return;
        }

        setAuthResolved(data.session ?? null);
      });

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange((_event, nextSession) => {
      setAuthResolved(nextSession);

      if (!nextSession) {
        clearBusinessProfile();
        void queryClient.removeQueries({
          queryKey: ["business-profile"],
        });
        void queryClient.removeQueries({
          queryKey: ["workspace"],
        });
        void queryClient.removeQueries({
          queryKey: ["revenuecat"],
        });
        void queryClient.removeQueries({
          queryKey: ["documents"],
        });
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [
    clearBusinessProfile,
    queryClient,
    setAuthLoading,
    setAuthResolved,
    setLastError,
  ]);

  const businessProfileQuery = useBusinessProfileQuery(session?.user.id);

  useEffect(() => {
    if (!session) {
      clearBusinessProfile();
      return;
    }

    if (businessProfileQuery.isPending) {
      setBusinessProfileLoading();
      return;
    }

    if (businessProfileQuery.isError) {
      setLastError(businessProfileQuery.error.message);
      clearBusinessProfile();
      return;
    }

    if (businessProfileQuery.isFetched) {
      if (businessProfileQuery.data) {
        setBusinessProfile(businessProfileQuery.data);
      } else {
        clearBusinessProfile();
      }
    }
  }, [
    businessProfileQuery.data,
    businessProfileQuery.error,
    businessProfileQuery.isError,
    businessProfileQuery.isFetched,
    businessProfileQuery.isPending,
    clearBusinessProfile,
    session,
    setBusinessProfile,
    setBusinessProfileLoading,
    setLastError,
  ]);

  useEffect(() => {
    let isActive = true;

    async function syncIdentity() {
      setRevenueCatStatus("configuring");

      try {
        const result = await syncRevenueCatIdentity(session?.user.id);

        if (!isActive) {
          return;
        }

        setRevenueCatStatus(result.supported ? "ready" : "unsupported");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setRevenueCatStatus("unsupported");
        setLastError(error instanceof Error ? error.message : "RevenueCat setup failed.");
      }
    }

    void syncIdentity();

    return () => {
      isActive = false;
    };
  }, [session?.user.id, setLastError, setRevenueCatStatus]);

  return null;
}
