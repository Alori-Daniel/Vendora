import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import {
  useDocumentGenerationAccess,
  useGenerateDocumentMutation,
} from "@/hooks/use-documents";
import { usePaymentDetailQuery } from "@/hooks/use-workspace";
import { shareGeneratedDocument } from "@/services/documents";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate, humanizeLabel } from "@/utils/formatters";
import { getInvoiceStatusTone, getStatusLabel } from "@/utils/vendor-status";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const paymentQuery = usePaymentDetailQuery(id);
  const documentAccess = useDocumentGenerationAccess();
  const generateDocumentMutation = useGenerateDocumentMutation();
  const paymentEntry = paymentQuery.data;
  const payment = paymentEntry?.payment;
  const order = paymentEntry?.order;
  const invoice = paymentEntry?.invoice;

  const handleGenerateReceipt = async () => {
    if (!session?.user.id || !businessProfile || !payment || !order) {
      return;
    }

    if (!documentAccess.hasActiveSubscription && !documentAccess.canGenerate) {
      router.push("/subscription");
      return;
    }

    const result = await generateDocumentMutation.mutateAsync({
      userId: session.user.id,
      businessProfile,
      order,
      invoice,
      payment,
      type: "receipt",
      hasActiveSubscription: documentAccess.hasActiveSubscription,
    });
    const shared = await shareGeneratedDocument(result.localUri);

    if (!shared) {
      Alert.alert(
        "Receipt ready",
        result.document.upload_status === "uploaded"
          ? "The receipt PDF was generated and stored in your workspace."
          : "The receipt PDF was generated on this device.",
      );
    }
  };

  if (paymentQuery.isPending) {
    return (
      <ScreenShell title="Payment details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">Loading payment...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (paymentQuery.isError) {
    return (
      <ScreenShell title="Payment details" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">{paymentQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (!payment || !order) {
    return (
      <ScreenShell title="Payment not found" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">
            This payment is not available in the current workspace.
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      subtitle={`${order.order_number} · Recorded ${formatDate(payment.recorded_at)}`}
      title="Payment details"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <ThemedText variant="subtitle">
              {order.customer?.full_name ?? "Walk-in customer"}
            </ThemedText>
            <ThemedText variant="muted">
              {humanizeLabel(payment.method)} payment recorded for this order.
            </ThemedText>
          </View>
          {invoice ? (
            <StatusPill
              label={getStatusLabel(invoice.status)}
              tone={getInvoiceStatusTone(invoice.status)}
            />
          ) : null}
        </View>
        <ThemedText style={styles.amount}>{formatCurrency(payment.amount)}</ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.summaryRow}>
          <ThemedText>Reference</ThemedText>
          <ThemedText>{payment.reference ?? "Not provided"}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Note</ThemedText>
          <ThemedText>{payment.note ?? "No note saved"}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Paid to date</ThemedText>
          <ThemedText>{formatCurrency(order.paidAmount)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.totalLabel}>Balance remaining</ThemedText>
          <ThemedText style={styles.totalLabel}>{formatCurrency(order.balance)}</ThemedText>
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <View style={styles.heroRow}>
          <ThemedText variant="subtitle">Receipt generation</ThemedText>
          <StatusPill
            label={
              documentAccess.hasActiveSubscription
                ? "Unlimited"
                : `${documentAccess.freeRemaining} left`
            }
            tone={documentAccess.hasActiveSubscription ? "success" : "warning"}
          />
        </View>
        <ThemedText variant="muted">{documentAccess.usageMessage}</ThemedText>
      </SurfaceCard>

      {generateDocumentMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <StatusPill label="Document error" tone="danger" />
          <ThemedText variant="muted">
            {generateDocumentMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={
            generateDocumentMutation.isPending ||
            documentAccess.isPending ||
            documentAccess.isBillingPending
          }
          label={
            generateDocumentMutation.isPending
              ? "Generating receipt..."
              : documentAccess.canGenerate
                ? "Generate receipt PDF"
                : "Subscribe to generate"
          }
          onPress={() => {
            if (!documentAccess.canGenerate && !documentAccess.hasActiveSubscription) {
              router.push("/subscription");
              return;
            }

            void handleGenerateReceipt();
          }}
        />
        <ThemedButton
          label="Open order"
          onPress={() => router.push(`/orders/${order.id}`)}
          variant="secondary"
        />
        {invoice ? (
          <ThemedButton
            label="View invoice"
            onPress={() => router.push(`/invoices/${invoice.id}`)}
            variant="secondary"
          />
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  amount: {
    fontSize: 34,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  totalLabel: {
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
});
