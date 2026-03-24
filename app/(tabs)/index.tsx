import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useDashboardQuery } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/utils/formatters";
import { radius, spacingY } from "@/utils/styling";
import { router } from "expo-router";

const quickActionItems = [
  {
    label: "New Order",
    icon: "add",
    route: "/orders/create",
  },
  {
    label: "Add Customer",
    icon: "person-add-outline",
    route: "/customers/create",
  },
  {
    label: "Send Invoice",
    icon: "document-text-outline",
    route: "/invoices",
  },
  {
    label: "Products",
    icon: "cube-outline",
    route: "/products",
  },
] as const;

const HomeScreen = () => {
  const { colors } = useAppTheme();
  const businessProfile = useAppStore((state) => state.businessProfile);
  const dashboardQuery = useDashboardQuery();
  const dashboard = dashboardQuery.data?.dashboard;
  const recentOrders = dashboard?.recentOrders ?? [];
  console.log("re", recentOrders);

  if (dashboardQuery.isPending) {
    return (
      <ScreenShell
        eyebrow={businessProfile?.business_category ?? "Vendor workspace"}
        subtitle="Loading your latest orders, balances, and customer activity."
        title={businessProfile?.business_name ?? "Dashboard"}
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading workspace metrics...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ScreenShell
        eyebrow={businessProfile?.business_category ?? "Vendor workspace"}
        subtitle="There was a problem loading the workspace snapshot."
        title={businessProfile?.business_name ?? "Dashboard"}
      >
        <SurfaceCard>
          <ThemedText variant="muted">
            {dashboardQuery.error.message}
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      smallTitle={true}
      // contentContainerStyle={{ borderWidth: 1 }}
      eyebrow={businessProfile?.business_category ?? "Vendor workspace"}
      subtitle="Here is your data-driven daily overview"
      title={`Good day, ${businessProfile?.business_name ?? "Vendor"}`}
    >
      <SurfaceCard tone="primary" verticalPadding={spacingY._10}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <ThemedText variant="subtitle">Sales Snapshot</ThemedText>
          </View>
          <StatusPill label="Live Data" tone="brand" />
        </View>
        <View style={styles.metricGrid}>
          <ThemedView style={{ backgroundColor: "transparent", flex: 1 }}>
            <ThemedText variant="titleSmall">
              {formatCurrency(dashboard?.salesToday ?? 0)}
            </ThemedText>
            <ThemedText variant="caption">Today Sales</ThemedText>
          </ThemedView>

          <ThemedView style={{ backgroundColor: "transparent", gap: 6 }}>
            <ThemedView style={{ backgroundColor: "transparent", gap: 1 }}>
              <ThemedText variant="titleSmall">
                {dashboard?.openOrders ?? 0}
              </ThemedText>
              <ThemedText variant="caption">Active Orders</ThemedText>
              <ThemedText variant="muted">
                ({dashboard?.unpaidInvoiceCount ?? 0} pending)
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ backgroundColor: "transparent", gap: 2 }}>
              <ThemedText variant="titleSmall">
                {formatCurrency(dashboard?.outstandingBalance ?? 0)}
              </ThemedText>
              <ThemedText variant="caption">Outstanding</ThemedText>
            </ThemedView>
          </ThemedView>
        </View>
      </SurfaceCard>

      <View style={styles.quickActionsSection}>
        <ThemedText variant="subtitle">Quick Actions</ThemedText>
        <View style={styles.quickActions}>
          {quickActionItems.map((action) => (
            <Pressable
              accessibilityRole="button"
              key={action.label}
              onPress={() => router.push(action.route)}
              style={({ pressed }) => [
                styles.quickActionItem,
                { opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons
                  color={colors.onPrimary}
                  name={action.icon}
                  size={21}
                />
              </View>
              <ThemedText style={styles.quickActionLabel}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard
          helper="Non-cancelled orders"
          label="Month-to-Date Revenue"
          smallRadius
          value={formatCurrency(dashboard?.salesThisMonth ?? 0)}
        />
        <MetricCard
          helper={`${dashboard?.cancelledOrders ?? 0} cancelled so far`}
          label="Completed"
          smallRadius
          tone="success"
          value={`${dashboard?.completedOrders ?? 0}`}
        />
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Recent orders</ThemedText>
          <ThemedText
            onPress={() => router.push("/orders")}
            style={styles.link}
            variant="caption"
          >
            View all
          </ThemedText>
        </View>
        <View style={styles.stack}>
          {recentOrders.length > 0 ? (
            recentOrders.slice(0, 2).map((order) => (
              <ListRow
                // accessory={
                //   <StatusPill
                //     label={getStatusLabel(order.status)}
                //     tone={getOrderStatusTone(order.status)}
                //   />
                // }
                key={order.id}
                meta={formatCurrency(order.subtotal)}
                onPress={() => router.push(`/orders/${order.id}`)}
                // subtitle={
                //   order.due_at
                //     ? `Due ${formatShortDate(order.due_at)}`
                //     : "No due date"
                // }
                subtitle={`${order.customer?.full_name ?? "Walk-in customer"}`}
                title={`${order.order_number}`}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No orders yet. Create the first one to populate the dashboard.
            </ThemedText>
          )}
        </View>
      </View>

      {/* <SurfaceCard>
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Startup checklist</ThemedText>
          <ThemedText variant="caption">
            Retention starts with daily habits
          </ThemedText>
        </View>
        <View style={styles.stack}>
          {(dashboard?.checklist ?? []).map((item) => (
            <View key={item.label} style={styles.checkItem}>
              <StatusPill
                label={item.completed ? "Done" : "Next"}
                tone={item.completed ? "success" : "info"}
              />
              <ThemedText style={styles.checkCopy}>{item.label}</ThemedText>
            </View>
          ))}
        </View>
      </SurfaceCard> */}
    </ScreenShell>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  heroHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
    // borderWidth: 1,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 15,
    // borderWidth: 1,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },
  quickActionsSection: {
    gap: 16,
  },
  quickActionItem: {
    alignItems: "center",
    flex: 1,
    gap: spacingY._5,
    minWidth: 68,
    // borderWidth: 1,
  },
  quickActionIconWrap: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 53,
    justifyContent: "center",
    width: 53,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  link: {
    fontWeight: "500",
  },
  checkItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  checkCopy: {
    flex: 1,
  },
});
