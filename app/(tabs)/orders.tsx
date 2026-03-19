import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useOrdersQuery } from "@/hooks/use-workspace";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { getOrderStatusTone, getStatusLabel } from "@/utils/vendor-status";

export default function OrdersScreen() {
  const ordersQuery = useOrdersQuery();
  const orders = ordersQuery.data?.orders ?? [];
  const openOrders = orders.filter(
    (order) => !["cancelled", "delivered"].includes(order.status),
  ).length;
  const unpaidOrders = orders.filter(
    (order) => order.invoice && order.invoice.status !== "paid",
  ).length;

  if (ordersQuery.isPending) {
    return (
      <ScreenShell
        subtitle="Capture and follow every order from DM to delivery."
        title="Orders"
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading orders...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (ordersQuery.isError) {
    return (
      <ScreenShell
        subtitle="Capture and follow every order from DM to delivery."
        title="Orders"
      >
        <SurfaceCard>
          <ThemedText variant="muted">{ordersQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton label="New order" onPress={() => router.push("/orders/create")} />
      }
      subtitle="Capture and follow every order from DM to delivery."
      title="Orders"
    >
      <View style={styles.metrics}>
        <SurfaceCard style={styles.metricCard} tone="muted">
          <ThemedText variant="caption">Open pipeline</ThemedText>
          <ThemedText style={styles.metricValue}>{openOrders}</ThemedText>
        </SurfaceCard>
        <SurfaceCard style={styles.metricCard}>
          <ThemedText variant="caption">Awaiting payment</ThemedText>
          <ThemedText style={styles.metricValue}>{unpaidOrders}</ThemedText>
        </SurfaceCard>
      </View>

      <SurfaceCard>
        <View style={styles.list}>
          {orders.length > 0 ? (
            orders.map((order) => (
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
                subtitle={`${
                  order.customer?.full_name ?? "Walk-in customer"
                } · ${
                  order.due_at ? `Due ${formatShortDate(order.due_at)}` : "No due date"
                }`}
                title={`${order.order_number} · ${formatCurrency(order.total)}`}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No orders yet. Use the New order flow to start tracking sales.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
});
