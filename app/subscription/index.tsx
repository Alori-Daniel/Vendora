import React from "react";
import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { subscriptionUpgradePoints } from "@/constants/business";
import { useDocumentGenerationAccess } from "@/hooks/use-documents";
import {
  usePurchaseRevenueCatPackageMutation,
  useRestoreRevenueCatPurchasesMutation,
  useRevenueCatCustomerInfoQuery,
  useRevenueCatOfferingsQuery,
} from "@/hooks/use-revenuecat";
import { appEnv } from "@/lib/env";
import { getRevenueCatSupport } from "@/lib/revenuecat";
import { useAppStore } from "@/stores/app-store";

export default function SubscriptionScreen() {
  const session = useAppStore((state) => state.session);
  const lastError = useAppStore((state) => state.lastError);
  const revenueCatStatus = useAppStore((state) => state.revenueCatStatus);
  const offeringsQuery = useRevenueCatOfferingsQuery();
  const customerInfoQuery = useRevenueCatCustomerInfoQuery(session?.user.id);
  const documentAccess = useDocumentGenerationAccess();
  const restorePurchasesMutation = useRestoreRevenueCatPurchasesMutation();
  const purchasePackageMutation = usePurchaseRevenueCatPackageMutation();
  const revenueCatSupport = getRevenueCatSupport();
  const currentOffering = offeringsQuery.data?.current;
  const featuredPackage = currentOffering?.availablePackages[0];
  const activeEntitlement = appEnv.revenueCatEntitlementId
    ? customerInfoQuery.data?.entitlements.active[appEnv.revenueCatEntitlementId]
    : undefined;

  return (
    <ScreenShell
      subtitle="This is where the paywall and trial messaging land in the MVP."
      title="Subscription"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <StatusPill
          label={activeEntitlement ? "Pro active" : "Subscription access"}
          tone="brand"
        />
        <ThemedText variant="title" style={styles.price}>
          {featuredPackage?.product.priceString ?? "Live pricing"}
        </ThemedText>
        <ThemedText variant="muted">
          Trials, billing periods, and package pricing come from your store
          products and RevenueCat offering instead of app-side seed data.
        </ThemedText>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <View style={styles.statusHeader}>
          <ThemedText variant="subtitle">Runtime status</ThemedText>
          <StatusPill
            label={revenueCatSupport.supported ? revenueCatStatus : "unsupported"}
            tone={revenueCatSupport.supported ? "brand" : "danger"}
          />
        </View>
        <ThemedText variant="muted">
          {revenueCatSupport.supported
            ? "RevenueCat is configured for this runtime. Offerings and restores are live below."
            : revenueCatSupport.reason}
        </ThemedText>
        {activeEntitlement ? (
          <StatusPill label={`${activeEntitlement.identifier} active`} tone="success" />
        ) : null}
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <View style={styles.statusHeader}>
          <ThemedText variant="subtitle">Document exports</ThemedText>
          <StatusPill
            label={
              documentAccess.hasActiveSubscription
                ? "Unlimited"
                : `${documentAccess.freeRemaining} free left`
            }
            tone={documentAccess.hasActiveSubscription ? "success" : "warning"}
          />
        </View>
        <ThemedText variant="muted">{documentAccess.usageMessage}</ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">What Pro unlocks</ThemedText>
        <View style={styles.list}>
          {subscriptionUpgradePoints.map((point) => (
            <ThemedText key={point}>{point}</ThemedText>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Available packages</ThemedText>
        <View style={styles.list}>
          {currentOffering?.availablePackages.length ? (
            currentOffering.availablePackages.map((aPackage) => (
              <SurfaceCard key={aPackage.identifier} tone="muted">
                <ThemedText variant="subtitle">{aPackage.product.title}</ThemedText>
                <ThemedText variant="muted">
                  {aPackage.product.description || aPackage.identifier}
                </ThemedText>
                <ThemedText style={styles.packagePrice}>
                  {aPackage.product.priceString}
                </ThemedText>
                <ThemedButton
                  disabled={
                    !revenueCatSupport.supported || purchasePackageMutation.isPending
                  }
                  label={
                    purchasePackageMutation.isPending
                      ? "Starting purchase..."
                      : "Buy package"
                  }
                  onPress={() => {
                    purchasePackageMutation.mutate(aPackage);
                  }}
                />
              </SurfaceCard>
            ))
          ) : (
            <ThemedText variant="muted">
              {offeringsQuery.isPending
                ? "Loading offerings from RevenueCat..."
                : "No offering was returned yet. Check the dashboard offering id and platform API keys."}
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      {purchasePackageMutation.error ||
      restorePurchasesMutation.error ||
      offeringsQuery.error ||
      customerInfoQuery.error ||
      lastError ? (
        <SurfaceCard tone="muted">
          <StatusPill label="Subscription error" tone="danger" />
          <ThemedText variant="muted">
            {purchasePackageMutation.error?.message ??
              restorePurchasesMutation.error?.message ??
              offeringsQuery.error?.message ??
              customerInfoQuery.error?.message ??
              lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={!revenueCatSupport.supported || restorePurchasesMutation.isPending}
          label={
            restorePurchasesMutation.isPending
              ? "Restoring purchases..."
              : "Restore purchases"
          }
          onPress={() => restorePurchasesMutation.mutate()}
        />
        <ThemedButton
          disabled={!revenueCatSupport.supported}
          label="Refresh status"
          onPress={() => {
            void customerInfoQuery.refetch();
          }}
          variant="secondary"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  price: {
    fontSize: 42,
  },
  list: {
    gap: 10,
  },
  statusHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
});
