import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useSignOutMutation } from "@/hooks/use-auth";
import { useAppStore } from "@/stores/app-store";

export default function SettingsScreen() {
  const businessProfile = useAppStore((state) => state.businessProfile);
  const revenueCatStatus = useAppStore((state) => state.revenueCatStatus);
  const lastError = useAppStore((state) => state.lastError);
  const signOutMutation = useSignOutMutation();

  return (
    <ScreenShell
      subtitle="Business identity and defaults that shape invoices and order management."
      title="Settings"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <ThemedText variant="subtitle">
          {businessProfile?.business_name ?? "Business profile"}
        </ThemedText>
        <ThemedText variant="muted">
          {businessProfile?.business_category ?? "Complete onboarding in Supabase"}
        </ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.list}>
          <ListRow
            subtitle="Business phone"
            title={businessProfile?.phone ?? "Not set"}
          />
          <ListRow
            subtitle="Invoice prefix"
            title={businessProfile?.invoice_prefix ?? "Not set"}
          />
          <ListRow
            subtitle="Default currency"
            title={businessProfile?.default_currency ?? "NGN"}
          />
          <ListRow
            subtitle="Bank details"
            title={businessProfile?.bank_details ?? "Not set"}
          />
          <ListRow
            subtitle="Address"
            title={businessProfile?.business_address ?? "Not set"}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">Integration status</ThemedText>
        <ThemedText variant="muted">
          RevenueCat runtime: {revenueCatStatus}. Supabase auth and business
          profile are now wired through the app store and React Query.
        </ThemedText>
      </SurfaceCard>

      {lastError ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Latest error</ThemedText>
          <ThemedText variant="muted">{lastError}</ThemedText>
        </SurfaceCard>
      ) : null}

      <ThemedButton
        disabled={signOutMutation.isPending}
        label={signOutMutation.isPending ? "Signing out..." : "Sign out"}
        onPress={() => signOutMutation.mutate()}
        variant="secondary"
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
