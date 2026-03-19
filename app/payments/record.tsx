import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCreatePaymentMutation } from "@/hooks/use-payments";
import { useWorkspaceSnapshotQuery } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/utils/formatters";
import { getInvoiceStatusTone, getStatusLabel } from "@/utils/vendor-status";

const paymentMethods = ["cash", "transfer", "pos", "card", "other"] as const;

export default function RecordPaymentScreen() {
  const { colors } = useAppTheme();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const workspaceQuery = useWorkspaceSnapshotQuery();
  const createPaymentMutation = useCreatePaymentMutation();
  const orders = workspaceQuery.data?.orders ?? [];
  const recordableOrders = orders.filter(
    (order) => order.balance > 0 || order.id === orderId,
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof paymentMethods)[number]>("transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const selectedOrder =
    recordableOrders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    if (typeof orderId === "string" && recordableOrders.some((order) => order.id === orderId)) {
      setSelectedOrderId(orderId);
      return;
    }

    if (!selectedOrderId && recordableOrders.length === 1) {
      setSelectedOrderId(recordableOrders[0].id);
    }
  }, [orderId, recordableOrders, selectedOrderId]);

  const handleSave = async () => {
    if (!session?.user.id || !businessProfile?.id || !selectedOrder) {
      return;
    }

    const payment = await createPaymentMutation.mutateAsync({
      user_id: session.user.id,
      business_profile_id: businessProfile.id,
      order_id: selectedOrder.id,
      invoice_id: selectedOrder.invoice?.id ?? null,
      amount: Number(amount) || 0,
      method,
      reference: reference.trim() || null,
      note: note.trim() || null,
      recorded_at: new Date().toISOString(),
    });

    router.replace(`/payments/${payment.id}`);
  };

  if (workspaceQuery.isPending) {
    return (
      <ScreenShell title="Record payment" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">Loading eligible orders...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <ScreenShell title="Record payment" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">{workspaceQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      subtitle="Record a payment once and the invoice balance updates automatically."
      title="Record payment"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <ThemedText variant="subtitle">Choose order</ThemedText>
        <View style={styles.stack}>
          {recordableOrders.length > 0 ? (
            recordableOrders.map((order) => (
              <ListRow
                accessory={
                  selectedOrderId === order.id ? (
                    <StatusPill label="selected" tone="brand" />
                  ) : order.invoice ? (
                    <StatusPill
                      label={getStatusLabel(order.invoice.status)}
                      tone={getInvoiceStatusTone(order.invoice.status)}
                    />
                  ) : undefined
                }
                key={order.id}
                meta={formatCurrency(order.balance)}
                onPress={() => setSelectedOrderId(order.id)}
                subtitle={order.customer?.full_name ?? "Walk-in customer"}
                title={order.order_number}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No open orders need payment right now.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      {selectedOrder ? (
        <SurfaceCard>
          <ThemedText variant="subtitle">Payment details</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText>Order total</ThemedText>
            <ThemedText>{formatCurrency(selectedOrder.total)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText>Paid so far</ThemedText>
            <ThemedText>{formatCurrency(selectedOrder.paidAmount)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Balance open</ThemedText>
            <ThemedText style={styles.totalLabel}>
              {formatCurrency(selectedOrder.balance)}
            </ThemedText>
          </View>
          <ThemedInput
            keyboardType="number-pad"
            label="Amount received"
            onChangeText={setAmount}
            placeholder={`${selectedOrder.balance}`}
            value={amount}
          />
          <ThemedInput
            label="Reference"
            onChangeText={setReference}
            placeholder="Transfer reference or receipt id"
            value={reference}
          />
          <ThemedInput
            label="Note"
            multiline
            numberOfLines={3}
            onChangeText={setNote}
            placeholder="Optional note about this payment"
            value={note}
          />
          <View style={styles.methodWrap}>
            {paymentMethods.map((paymentMethod) => (
              <Pressable
                key={paymentMethod}
                onPress={() => setMethod(paymentMethod)}
                style={[
                  styles.methodPill,
                  {
                    backgroundColor:
                      method === paymentMethod ? colors.primaryMuted : colors.surface,
                    borderColor:
                      method === paymentMethod ? colors.primary : colors.border,
                  },
                ]}
              >
                <ThemedText variant="caption">
                  {getStatusLabel(paymentMethod)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      ) : null}

      {createPaymentMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <StatusPill label="Payment save failed" tone="danger" />
          <ThemedText variant="muted">
            {createPaymentMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={
            !session ||
            !businessProfile ||
            !selectedOrder ||
            Number(amount) <= 0 ||
            createPaymentMutation.isPending
          }
          label={
            createPaymentMutation.isPending ? "Saving payment..." : "Save payment"
          }
          onPress={() => {
            void handleSave();
          }}
        />
        <ThemedButton
          label="Cancel"
          onPress={() => router.back()}
          variant="secondary"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  methodWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  methodPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actions: {
    gap: 12,
  },
});
