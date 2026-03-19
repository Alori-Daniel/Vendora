import type { AuthSession } from "@supabase/supabase-js";
import { create } from "zustand";

import type { BusinessProfileRow } from "@/types/supabase";

type AuthStatus = "loading" | "authenticated" | "anonymous";
type ProfileStatus = "idle" | "loading" | "loaded";
type RevenueCatStatus = "idle" | "configuring" | "ready" | "unsupported";

type AppState = {
  authStatus: AuthStatus;
  profileStatus: ProfileStatus;
  revenueCatStatus: RevenueCatStatus;
  session: AuthSession | null;
  businessProfile: BusinessProfileRow | null;
  lastError: string | null;
  setAuthLoading: () => void;
  setAuthResolved: (session: AuthSession | null) => void;
  setBusinessProfileLoading: () => void;
  setBusinessProfile: (profile: BusinessProfileRow) => void;
  clearBusinessProfile: () => void;
  setRevenueCatStatus: (status: RevenueCatStatus) => void;
  setLastError: (message: string | null) => void;
  reset: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  authStatus: "loading",
  profileStatus: "idle",
  revenueCatStatus: "idle",
  session: null,
  businessProfile: null,
  lastError: null,
  setAuthLoading: () => set({ authStatus: "loading" }),
  setAuthResolved: (session) =>
    set(() => {
      const previousUserId = get().session?.user.id;
      const nextUserId = session?.user.id;
      const shouldResetProfile = previousUserId !== nextUserId;

      return {
        session,
        authStatus: session ? "authenticated" : "anonymous",
        businessProfile: shouldResetProfile ? null : get().businessProfile,
        profileStatus: session
          ? shouldResetProfile
            ? "loading"
            : get().profileStatus
          : "idle",
      };
    }),
  setBusinessProfileLoading: () => set({ profileStatus: "loading" }),
  setBusinessProfile: (profile) =>
    set({
      businessProfile: profile,
      profileStatus: "loaded",
      lastError: null,
    }),
  clearBusinessProfile: () =>
    set({
      businessProfile: null,
      profileStatus: "loaded",
    }),
  setRevenueCatStatus: (status) => set({ revenueCatStatus: status }),
  setLastError: (message) => set({ lastError: message }),
  reset: () =>
    set({
      authStatus: "anonymous",
      profileStatus: "idle",
      revenueCatStatus: "idle",
      session: null,
      businessProfile: null,
      lastError: null,
    }),
}));
