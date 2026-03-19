import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedText } from "@/components/themed-text";
import { useAppStore } from "@/stores/app-store";

const moreLinks = [
  {
    title: "Products",
    subtitle: "Catalog, pricing, and active product toggles",
    path: "/products",
  },
  {
    title: "Invoices",
    subtitle: "Preview, share, and review invoice history",
    path: "/invoices",
  },
  {
    title: "Analytics",
    subtitle: "Sales, top products, and top customers",
    path: "/analytics",
  },
  {
    title: "Payments",
    subtitle: "Transaction log and balance collection",
    path: "/payments",
  },
  {
    title: "Subscription",
    subtitle: "Trial, paywall, and upgrade prompts",
    path: "/subscription",
  },
  {
    title: "Settings",
    subtitle: "Business profile, currency, invoice prefix, and bank details",
    path: "/settings",
  },
] as const;

export default function MoreScreen() {
  const businessProfile = useAppStore((state) => state.businessProfile);

  return (
    <ScreenShell
      subtitle="Everything outside the main daily tabs still lives one tap away."
      title="More"
    >
      <SurfaceCard tone="primary">
        <View style={styles.planHeader}>
          <View style={styles.planCopy}>
            <ThemedText variant="subtitle">
              {businessProfile?.business_name ?? "Business workspace"}
            </ThemedText>
            <ThemedText variant="muted">
              {businessProfile?.business_address ?? "Open subscription, settings, and reporting from here."}
            </ThemedText>
          </View>
          <StatusPill label="Workspace tools" tone="brand" />
        </View>
        <ThemedText variant="muted">
          Manage products, invoices, analytics, payments, settings, and
          subscription access without relying on seeded demo content.
        </ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.list}>
          {moreLinks.map((item) => (
            <ListRow
              key={item.path}
              onPress={() => router.push(item.path)}
              subtitle={item.subtitle}
              title={item.title}
            />
          ))}
        </View>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  planHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  planCopy: {
    flex: 1,
    gap: 8,
  },
  list: {
    gap: 12,
  },
});
