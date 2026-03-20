import SplashLoading from "@/components/loading-splash";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { idealFirstNicheLabel } from "@/constants/business";
import { useAppStore } from "@/stores/app-store";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const IndexScreen = () => {
  const authStatus = useAppStore((state) => state.authStatus);
  const profileStatus = useAppStore((state) => state.profileStatus);

  const setAuthLoading = useAppStore((state) => state.setAuthLoading);

  return (
    <>
      {authStatus === "authenticated" ||
      authStatus === "loading" ||
      profileStatus === "loading" ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn} exiting={FadeOut}>
          <SplashLoading />
        </Animated.View>
      ) : (
        <ScreenShell scrollable>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <SurfaceCard style={styles.hero} tone="primary">
              <StatusPill label="Mobile-first vendor OS" tone="brand" />
              <ThemedText style={styles.heroTitle} variant="title">
                Run your WhatsApp orders without spreadsheet chaos.
              </ThemedText>
              <ThemedText variant="muted">
                Track orders, share invoices, monitor balances, and keep
                deliveries moving from one mobile workspace built for Instagram
                and WhatsApp sellers.
              </ThemedText>
              <View style={styles.ctaGroup}>
                <ThemedButton
                  label="Preview dashboard"
                  onPress={() => router.replace("/(tabs)")}
                />
                <ThemedButton
                  label="Sign in"
                  onPress={() => router.push("/auth/sign-in")}
                  variant="secondary"
                />
              </View>
              <ThemedText
                onPress={() => router.push("/auth/sign-up")}
                style={styles.inlineLink}
                variant="caption"
              >
                New vendor? Create account and start your free trial.
              </ThemedText>
            </SurfaceCard>

            <View style={styles.metrics}>
              <MetricCard
                helper="Designed for fast order capture"
                label="Goal"
                tone="brand"
                value="< 60s"
              />
              <MetricCard
                helper="What vendors need immediately"
                label="MVP flow"
                tone="warning"
                value="Orders"
              />
            </View>

            <SurfaceCard>
              <ThemedText variant="subtitle">First niche</ThemedText>
              <ThemedText variant="muted">
                Start with Instagram and WhatsApp product sellers. They already
                feel the pain of scattered chats, manual invoicing, and unpaid
                balances.
              </ThemedText>
              <View style={styles.pillRow}>
                <StatusPill label={idealFirstNicheLabel} tone="brand" />
                <StatusPill label="Invoices from orders" tone="info" />
                <StatusPill label="Payment tracking" tone="warning" />
              </View>
            </SurfaceCard>

            <SurfaceCard>
              <ThemedText variant="subtitle">Phase 1 MVP</ThemedText>
              <View style={styles.featureList}>
                <ThemedText>Authentication and business setup</ThemedText>
                <ThemedText>Customers, products, and orders</ThemedText>
                <ThemedText>
                  Invoices, payment tracking, and dashboard
                </ThemedText>
                <ThemedText>Subscription paywall with RevenueCat</ThemedText>
              </View>
            </SurfaceCard>
          </Animated.View>
        </ScreenShell>
      )}
    </>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  hero: {
    gap: 18,
  },
  heroTitle: {
    maxWidth: 320,
  },
  ctaGroup: {
    gap: 12,
  },
  inlineLink: {
    fontWeight: "600",
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureList: {
    gap: 10,
  },
});
