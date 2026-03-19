import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useWorkspaceSnapshotQuery } from "@/hooks/use-workspace";
import { formatCurrency, formatDate, humanizeLabel } from "@/utils/formatters";

export default function PaymentsScreen() {
  const workspaceQuery = useWorkspaceSnapshotQuery();
  const orders = workspaceQuery.data?.orders ?? [];
  const payments = orders.flatMap((order) =>
    order.payments.map((payment) => ({
      ...payment,
      orderNumber: order.order_number,
    })),
  );
  const totalCollected = payments.reduce((total, payment) => total + payment.amount, 0);
  const outstandingBalance = workspaceQuery.data?.dashboard.outstandingBalance ?? 0;

  if (workspaceQuery.isPending) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Record payment"
            onPress={() => router.push("/payments/record")}
          />
        }
        subtitle="Payments are recorded against orders so balances update instantly."
        title="Payments log"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading payments...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Record payment"
            onPress={() => router.push("/payments/record")}
          />
        }
        subtitle="Payments are recorded against orders so balances update instantly."
        title="Payments log"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">{workspaceQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton
          label="Record payment"
          onPress={() => router.push("/payments/record")}
        />
      }
      subtitle="Payments are recorded against orders so balances update instantly."
      title="Payments log"
      withBackButton
    >
      <View style={styles.metrics}>
        <MetricCard label="Collected" tone="success" value={formatCurrency(totalCollected)} />
        <MetricCard
          label="Still open"
          tone="warning"
          value={formatCurrency(outstandingBalance)}
        />
      </View>

      <SurfaceCard>
        <View style={styles.list}>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <ListRow
                key={payment.id}
                meta={formatCurrency(payment.amount)}
                onPress={() => router.push(`/payments/${payment.id}`)}
                subtitle={`${humanizeLabel(payment.method)} · ${formatDate(payment.recorded_at)}`}
                title={`${payment.orderNumber} · ${payment.note ?? "Payment recorded"}`}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No payments have been recorded for this workspace yet.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">V1 payment methods</ThemedText>
        <ThemedText variant="muted">
          Cash, transfer, POS, card, and other are enough for the first release.
          The important part is the remaining balance after every payment entry.
        </ThemedText>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: 12,
  },
  list: {
    gap: 12,
  },
});
