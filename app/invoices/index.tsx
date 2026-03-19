import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { MetricCard } from "@/components/metric-card";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedText } from "@/components/themed-text";
import { useInvoicesQuery } from "@/hooks/use-workspace";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { getInvoiceStatusTone, getStatusLabel } from "@/utils/vendor-status";

export default function InvoicesScreen() {
  const invoicesQuery = useInvoicesQuery();
  const invoices = invoicesQuery.data ?? [];
  const unpaidCount = invoices.filter((entry) => entry.invoice.status !== "paid").length;

  if (invoicesQuery.isPending) {
    return (
      <ScreenShell
        subtitle="Invoices stay derived from orders so the workflow stays clean."
        title="Invoices"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading invoices...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (invoicesQuery.isError) {
    return (
      <ScreenShell
        subtitle="Invoices stay derived from orders so the workflow stays clean."
        title="Invoices"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">{invoicesQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      subtitle="Invoices stay derived from orders so the workflow stays clean."
      title="Invoices"
      withBackButton
    >
      <View style={styles.metrics}>
        <MetricCard label="Issued" value={`${invoices.length}`} />
        <MetricCard label="Open" tone="warning" value={`${unpaidCount}`} />
      </View>

      <SurfaceCard>
        <View style={styles.list}>
          {invoices.length > 0 ? (
            invoices.map(({ invoice, order }) => (
              <ListRow
                accessory={
                  <StatusPill
                    label={getStatusLabel(invoice.status)}
                    tone={getInvoiceStatusTone(invoice.status)}
                  />
                }
                key={invoice.id}
                meta={formatCurrency(order.total)}
                onPress={() => router.push(`/invoices/${invoice.id}`)}
                subtitle={
                  invoice.due_at
                    ? `Due ${formatShortDate(invoice.due_at)}`
                    : "No due date"
                }
                title={invoice.invoice_number}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No invoices yet. The first confirmed order can generate one.
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
  list: {
    gap: 12,
  },
});
