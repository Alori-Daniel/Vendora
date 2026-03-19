import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useCustomersQuery } from "@/hooks/use-workspace";
import { formatCurrency } from "@/utils/formatters";

export default function CustomersScreen() {
  const customersQuery = useCustomersQuery();
  const customers = customersQuery.data?.customers ?? [];
  const totalOutstanding = customers.reduce(
    (total, customer) => total + customer.outstandingBalance,
    0,
  );

  if (customersQuery.isPending) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Add customer"
            onPress={() => router.push("/customers/create")}
          />
        }
        subtitle="Customer profiles, balances, notes, and repeat-order history."
        title="Customers"
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading customers...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (customersQuery.isError) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Add customer"
            onPress={() => router.push("/customers/create")}
          />
        }
        subtitle="Customer profiles, balances, notes, and repeat-order history."
        title="Customers"
      >
        <SurfaceCard>
          <ThemedText variant="muted">{customersQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton
          label="Add customer"
          onPress={() => router.push("/customers/create")}
        />
      }
      subtitle="Customer profiles, balances, notes, and repeat-order history."
      title="Customers"
    >
      <View style={styles.metrics}>
        <MetricCard label="Total customers" value={`${customers.length}`} />
        <MetricCard
          helper="Across active invoices"
          label="Outstanding"
          tone="warning"
          value={formatCurrency(totalOutstanding)}
        />
      </View>

      <SurfaceCard>
        <View style={styles.list}>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <ListRow
                accessory={
                  customer.outstandingBalance > 0 ? (
                    <StatusPill label="balance open" tone="warning" />
                  ) : (
                    <StatusPill label="settled" tone="success" />
                  )
                }
                key={customer.id}
                meta={formatCurrency(customer.totalSpend)}
                onPress={() => router.push(`/customers/${customer.id}`)}
                subtitle={customer.phone}
                title={customer.full_name}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText variant="muted">
                No customers yet. Add your first customer before creating an
                order.
              </ThemedText>
              <ThemedButton
                label="Add first customer"
                onPress={() => router.push("/customers/create")}
              />
            </View>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">Why this matters</ThemedText>
        <ThemedText variant="muted">
          Vendors need customer context quickly: who owes, who repeats, where to
          deliver, and what note should be remembered before the next order.
        </ThemedText>
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
  list: {
    gap: 12,
  },
  emptyState: {
    gap: 12,
  },
});
