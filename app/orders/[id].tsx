import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useUpdateOrderStatusMutation } from "@/hooks/use-orders";
import { useOrderDetailQuery } from "@/hooks/use-workspace";
import type { OrderStatus } from "@/types/supabase";
import { formatCurrency, formatDate, humanizeLabel } from "@/utils/formatters";
import {
  getDeliveryStatusTone,
  getInvoiceStatusTone,
  getOrderStatusTone,
  getStatusLabel,
} from "@/utils/vendor-status";

type OrderStageAction = {
  label: string;
  status: OrderStatus;
  variant?: "primary" | "secondary";
};

function getOrderStageActions(status: OrderStatus): OrderStageAction[] {
  switch (status) {
    case "draft":
      return [
        { label: "Confirm order", status: "confirmed" },
        { label: "Cancel order", status: "cancelled", variant: "secondary" },
      ];
    case "confirmed":
      return [
        { label: "Start work", status: "in_progress" },
        { label: "Cancel order", status: "cancelled", variant: "secondary" },
      ];
    case "in_progress":
      return [
        { label: "Mark ready", status: "ready" },
        { label: "Cancel order", status: "cancelled", variant: "secondary" },
      ];
    case "ready":
      return [
        { label: "Out for delivery", status: "out_for_delivery" },
        { label: "Mark delivered", status: "delivered", variant: "secondary" },
        { label: "Cancel order", status: "cancelled", variant: "secondary" },
      ];
    case "out_for_delivery":
      return [{ label: "Mark delivered", status: "delivered" }];
    default:
      return [];
  }
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderQuery = useOrderDetailQuery(id);
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const [pendingStatus, setPendingStatus] = React.useState<OrderStatus | null>(null);
  const order = orderQuery.data;

  if (orderQuery.isPending) {
    return (
      <ScreenShell title="Order details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">Loading order details...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (orderQuery.isError) {
    return (
      <ScreenShell title="Order details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">{orderQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (!order) {
    return (
      <ScreenShell title="Order not found" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">
            The requested order could not be found in this workspace.
          </ThemedText>
          <ThemedButton label="Back to orders" onPress={() => router.replace("/orders")} />
        </SurfaceCard>
      </ScreenShell>
    );
  }

  const invoice = order.invoice;
  const orderId = order.id;
  const stageActions = getOrderStageActions(order.status);

  async function handleStatusUpdate(status: OrderStatus) {
    try {
      setPendingStatus(status);
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status,
      });
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <ScreenShell
      subtitle={`${order.order_number} · Created ${formatDate(order.created_at)}`}
      title="Order details"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <ThemedText variant="subtitle">
              {order.customer?.full_name ?? "Unassigned customer"}
            </ThemedText>
            <ThemedText variant="muted">{order.customer?.phone ?? "No phone saved"}</ThemedText>
          </View>
          <View style={styles.statuses}>
            <StatusPill
              label={getStatusLabel(order.status)}
              tone={getOrderStatusTone(order.status)}
            />
            <StatusPill
              label={getStatusLabel(order.delivery_status)}
              tone={getDeliveryStatusTone(order.delivery_status)}
            />
            {invoice ? (
              <StatusPill
                label={getStatusLabel(invoice.status)}
                tone={getInvoiceStatusTone(invoice.status)}
              />
            ) : null}
          </View>
        </View>
        <ThemedText variant="muted">{order.notes ?? "No order notes yet."}</ThemedText>
      </SurfaceCard>

      {stageActions.length > 0 ? (
        <SurfaceCard>
          <ThemedText variant="subtitle">Update order stage</ThemedText>
          <ThemedText variant="muted">
            Move this order through confirmation, fulfillment, delivery, and completion.
          </ThemedText>
          <View style={styles.statusActions}>
            {stageActions.map((action) => (
              <ThemedButton
                key={action.status}
                disabled={updateOrderStatusMutation.isPending}
                label={pendingStatus === action.status ? "Updating..." : action.label}
                onPress={() => handleStatusUpdate(action.status)}
                variant={action.variant ?? "primary"}
              />
            ))}
          </View>
          {updateOrderStatusMutation.isError ? (
            <ThemedText variant="muted">
              {updateOrderStatusMutation.error.message}
            </ThemedText>
          ) : null}
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <ThemedText variant="subtitle">Line items</ThemedText>
        <View style={styles.stack}>
          {order.items.map((item) => (
            <ListRow
              key={item.name}
              meta={formatCurrency(item.quantity * item.unit_price)}
              subtitle={`${item.quantity} x ${formatCurrency(item.unit_price)}`}
              title={item.name}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Financial summary</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText>Subtotal</ThemedText>
          <ThemedText>{formatCurrency(order.subtotal)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Delivery fee</ThemedText>
          <ThemedText>{formatCurrency(order.delivery_fee)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Discount</ThemedText>
          <ThemedText>{formatCurrency(order.discount)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Paid so far</ThemedText>
          <ThemedText>{formatCurrency(order.paidAmount)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.totalLabel}>Balance</ThemedText>
          <ThemedText style={styles.totalLabel}>{formatCurrency(order.balance)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Order total</ThemedText>
          <ThemedText>{formatCurrency(order.total)}</ThemedText>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Payments</ThemedText>
        <View style={styles.stack}>
          {order.payments.length > 0 ? (
            order.payments.map((payment) => (
              <ListRow
                key={payment.id}
                meta={formatCurrency(payment.amount)}
                onPress={() => router.push(`/payments/${payment.id}`)}
                subtitle={`${humanizeLabel(payment.method)} · ${formatDate(payment.recorded_at)}`}
                title={payment.note ?? "Payment recorded"}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No payment has been recorded yet for this order.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <View style={styles.actions}>
        <ThemedButton
          label="Record payment"
          onPress={() => router.push(`/payments/record?orderId=${orderId}`)}
        />
        <ThemedButton
          label="Open payments log"
          onPress={() => router.push("/payments")}
          variant="secondary"
        />
        {invoice ? (
          <ThemedButton
            label="View invoice"
            onPress={() => router.push(`/invoices/${invoice.id}`)}
            variant="secondary"
          />
        ) : (
          <ThemedButton disabled label="No invoice yet" variant="secondary" />
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  statuses: {
    alignItems: "flex-end",
    gap: 8,
  },
  stack: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
  statusActions: {
    gap: 10,
  },
});
