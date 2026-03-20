import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAppStore } from "@/stores/app-store";

const protectedRootSegments = new Set([
  "(tabs)",
  "orders",
  "customers",
  "products",
  "invoices",
  "payments",
  "analytics",
  "subscription",
  "settings",
]);

export function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const session = useAppStore((state) => state.session);
  const authStatus = useAppStore((state) => state.authStatus);
  const profileStatus = useAppStore((state) => state.profileStatus);
  const businessProfile = useAppStore((state) => state.businessProfile);

  useEffect(() => {
    if (!navigationState?.key || authStatus === "loading") {
      return;
    }

    const firstSegment = segments[0];
    const inAuth = firstSegment === "auth";
    const inOnboarding = firstSegment === "onboarding";
    const inProtectedRoute =
      Boolean(firstSegment) && protectedRootSegments.has(firstSegment);

    if (!session) {
      if (inProtectedRoute || inOnboarding) {
        router.replace("/auth/sign-in");
      }

      return;
    }

    if (profileStatus === "loading") {
      return;
    }

    if (!businessProfile) {
      if (!inOnboarding) {
        router.replace("/onboarding/business-setup");
      }

      return;
    }

    if (inAuth || inOnboarding || !firstSegment) {
      router.replace("/(tabs)");
    }
  }, [
    authStatus,
    businessProfile,
    navigationState?.key,
    profileStatus,
    router,
    segments,
    session,
  ]);

  return null;
}
