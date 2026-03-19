import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import { useDashboardQuery } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { getOrderStatusTone, getStatusLabel } from "@/utils/vendor-status";
import { router } from "expo-router";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

const HomeScreen = () => {
  const businessProfile = useAppStore((state) => state.businessProfile);
  const dashboardQuery = useDashboardQuery();
  const dashboard = dashboardQuery.data?.dashboard;
  const recentOrders = dashboard?.recentOrders ?? [];

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
          <ThemedText variant="muted">{dashboardQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow={businessProfile?.business_category ?? "Vendor workspace"}
      subtitle="Everything the vendor needs at a glance when the app opens."
      title={`Good morning, ${businessProfile?.business_name ?? "Vendor"}`}
    >
      <SurfaceCard tone="primary">
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <ThemedText variant="subtitle">Today’s business status</ThemedText>
            <ThemedText variant="muted">
              {dashboard?.openOrders ?? 0} active orders,{" "}
              {dashboard?.unpaidInvoiceCount ?? 0} invoices still awaiting full
              payment.
            </ThemedText>
          </View>
          <StatusPill label="Workspace live" tone="brand" />
        </View>
        <View style={styles.metricGrid}>
          <MetricCard
            helper="Booked from today’s orders"
            label="Sales today"
            tone="brand"
            value={formatCurrency(dashboard?.salesToday ?? 0)}
          />
          <MetricCard
            helper="Across unpaid and partial invoices"
            label="Outstanding"
            tone="warning"
            value={formatCurrency(dashboard?.outstandingBalance ?? 0)}
          />
        </View>
      </SurfaceCard>

      <View style={styles.quickActions}>
        <ThemedButton label="New order" onPress={() => router.push("/orders/create")} />
        <ThemedButton
          label="Payments log"
          onPress={() => router.push("/payments")}
          variant="secondary"
        />
      </View>

      <View style={styles.metricGrid}>
        <MetricCard
          helper="Non-cancelled orders"
          label="This month"
          value={formatCurrency(dashboard?.salesThisMonth ?? 0)}
        />
        <MetricCard
          helper={`${dashboard?.cancelledOrders ?? 0} cancelled so far`}
          label="Completed"
          tone="success"
          value={`${dashboard?.completedOrders ?? 0}`}
        />
      </View>

      <SurfaceCard>
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
            recentOrders.map((order) => (
              <ListRow
                accessory={
                  <StatusPill
                    label={getStatusLabel(order.status)}
                    tone={getOrderStatusTone(order.status)}
                  />
                }
                key={order.id}
                meta={formatCurrency(order.balance)}
                onPress={() => router.push(`/orders/${order.id}`)}
                subtitle={
                  order.due_at
                    ? `Due ${formatShortDate(order.due_at)}`
                    : "No due date"
                }
                title={`${order.order_number} · ${
                  order.customer?.full_name ?? "Walk-in customer"
                }`}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No orders yet. Create the first one to populate the dashboard.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Startup checklist</ThemedText>
          <ThemedText variant="caption">Retention starts with daily habits</ThemedText>
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
      </SurfaceCard>
    </ScreenShell>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  heroHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  link: {
    fontWeight: "700",
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
