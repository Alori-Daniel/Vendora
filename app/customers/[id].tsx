import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useCustomerDetailQuery } from "@/hooks/use-workspace";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { getOrderStatusTone, getStatusLabel } from "@/utils/vendor-status";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerQuery = useCustomerDetailQuery(id);
  const customer = customerQuery.data;

  if (customerQuery.isPending) {
    return (
      <ScreenShell title="Customer details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">Loading customer details...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (customerQuery.isError) {
    return (
      <ScreenShell title="Customer details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">{customerQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (!customer) {
    return (
      <ScreenShell title="Customer not found" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">
            This customer profile is not available in the current workspace.
          </ThemedText>
          <ThemedButton
            label="Back to customers"
            onPress={() => router.replace("/customers")}
          />
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      subtitle={`${customer.phone} · ${customer.email ?? "No email saved"}`}
      title={customer.full_name}
      withBackButton
    >
      <View style={styles.metrics}>
        <MetricCard label="Lifetime spend" value={formatCurrency(customer.totalSpend)} />
        <MetricCard
          label="Outstanding"
          tone="warning"
          value={formatCurrency(customer.outstandingBalance)}
        />
      </View>

      <SurfaceCard tone="primary">
        <ThemedText variant="subtitle">Customer notes</ThemedText>
        <ThemedText variant="muted">{customer.notes ?? "No notes yet."}</ThemedText>
        <View style={styles.tags}>
          {customer.tags.map((tag) => (
            <StatusPill key={tag} label={tag} tone="info" />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Delivery details</ThemedText>
        <ThemedText>{customer.address ?? "No address saved"}</ThemedText>
        <ThemedText variant="caption">{customer.landmark ?? "No landmark saved"}</ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Order history</ThemedText>
        <View style={styles.list}>
          {customer.orders.length > 0 ? (
            customer.orders.map((order) => (
              <ListRow
                accessory={
                  <StatusPill
                    label={getStatusLabel(order.status)}
                    tone={getOrderStatusTone(order.status)}
                  />
                }
                key={order.id}
                meta={formatShortDate(order.created_at)}
                onPress={() => router.push(`/orders/${order.id}`)}
                subtitle={
                  order.due_at ? `Due ${formatShortDate(order.due_at)}` : "No due date"
                }
                title={order.order_number}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No orders recorded for this customer yet.
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
    flexWrap: "wrap",
    gap: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  list: {
    gap: 12,
  },
});
