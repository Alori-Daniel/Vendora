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
import { useInvoiceDetailQuery } from "@/hooks/use-workspace";
import { shareGeneratedDocument } from "@/services/documents";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { getInvoiceStatusTone, getStatusLabel } from "@/utils/vendor-status";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const invoiceQuery = useInvoiceDetailQuery(id);
  const documentAccess = useDocumentGenerationAccess();
  const generateDocumentMutation = useGenerateDocumentMutation();
  const order = invoiceQuery.data;
  const invoice = order?.invoice;

  const handleGenerateInvoice = async () => {
    if (!session?.user.id || !businessProfile || !invoice || !order) {
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
      type: "invoice",
      hasActiveSubscription: documentAccess.hasActiveSubscription,
    });
    const shared = await shareGeneratedDocument(result.localUri);

    if (!shared) {
      Alert.alert(
        "Invoice ready",
        result.document.upload_status === "uploaded"
          ? "The invoice PDF was generated and stored in your workspace."
          : "The invoice PDF was generated on this device.",
      );
    }
  };

  if (invoiceQuery.isPending) {
    return (
      <ScreenShell title="Invoice preview" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">Loading invoice...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (invoiceQuery.isError) {
    return (
      <ScreenShell title="Invoice preview" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">{invoiceQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (!invoice || !order) {
    return (
      <ScreenShell title="Invoice not found" withBackButton>
        <SurfaceCard>
          <ThemedText variant="muted">
            This invoice is not available in the current workspace.
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      subtitle={`${invoice.invoice_number} · Issued ${formatDate(invoice.issued_at)}`}
      title="Invoice preview"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceParty}>
            <ThemedText variant="subtitle">
              {businessProfile?.business_name ?? "Business profile"}
            </ThemedText>
            <ThemedText variant="caption">
              {businessProfile?.business_address ?? "No business address saved"}
            </ThemedText>
            <ThemedText variant="caption">
              {businessProfile?.bank_details ?? "No bank details saved"}
            </ThemedText>
          </View>
          <StatusPill
            label={getStatusLabel(invoice.status)}
            tone={getInvoiceStatusTone(invoice.status)}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Bill to</ThemedText>
        <ThemedText>{order.customer?.full_name ?? "Walk-in customer"}</ThemedText>
        <ThemedText variant="caption">
          {order.customer?.address ?? "No customer address saved"}
        </ThemedText>
        <ThemedText variant="caption">
          Due {invoice.due_at ? formatDate(invoice.due_at) : "Not set"}
        </ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Items</ThemedText>
        <View style={styles.items}>
          {order.items.map((item) => (
            <View key={item.name} style={styles.itemRow}>
              <View style={styles.itemCopy}>
                <ThemedText>{item.name}</ThemedText>
                <ThemedText variant="caption">
                  {item.quantity} x {formatCurrency(item.unit_price)}
                </ThemedText>
              </View>
              <ThemedText>{formatCurrency(item.unit_price * item.quantity)}</ThemedText>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.itemRow}>
          <ThemedText>Subtotal</ThemedText>
          <ThemedText>{formatCurrency(order.subtotal)}</ThemedText>
        </View>
        <View style={styles.itemRow}>
          <ThemedText>Delivery fee</ThemedText>
          <ThemedText>{formatCurrency(order.delivery_fee)}</ThemedText>
        </View>
        <View style={styles.itemRow}>
          <ThemedText>Discount</ThemedText>
          <ThemedText>{formatCurrency(order.discount)}</ThemedText>
        </View>
        <View style={styles.itemRow}>
          <ThemedText>Paid</ThemedText>
          <ThemedText>{formatCurrency(order.paidAmount)}</ThemedText>
        </View>
        <View style={styles.itemRow}>
          <ThemedText style={styles.totalText}>Balance due</ThemedText>
          <ThemedText style={styles.totalText}>{formatCurrency(order.balance)}</ThemedText>
        </View>
        <View style={styles.itemRow}>
          <ThemedText style={styles.totalText}>Invoice total</ThemedText>
          <ThemedText style={styles.totalText}>{formatCurrency(order.total)}</ThemedText>
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <View style={styles.invoiceHeader}>
          <ThemedText variant="subtitle">Document access</ThemedText>
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
              ? "Generating invoice..."
              : documentAccess.canGenerate
                ? "Generate invoice PDF"
                : "Subscribe to generate"
          }
          onPress={() => {
            if (!documentAccess.canGenerate && !documentAccess.hasActiveSubscription) {
              router.push("/subscription");
              return;
            }

            void handleGenerateInvoice();
          }}
        />
        <ThemedButton
          label="Record payment"
          onPress={() => router.push(`/payments/record?orderId=${order.id}`)}
          variant="secondary"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  invoiceHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  invoiceParty: {
    flex: 1,
    gap: 6,
  },
  items: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  totalText: {
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
});
