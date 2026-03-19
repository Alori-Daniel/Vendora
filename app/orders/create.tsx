import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useCreateOrderMutation } from "@/hooks/use-orders";
import { useProductsQuery } from "@/hooks/use-products";
import { useCustomersQuery } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

export default function CreateOrderScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const customersQuery = useCustomersQuery();
  const productsQuery = useProductsQuery();
  const createOrderMutation = useCreateOrderMutation();
  const customers = customersQuery.data?.customers;
  const customerList = customers ?? [];
  const products = (productsQuery.data ?? []).filter(
    (product) => product.is_active,
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [discount, setDiscount] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedItems = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          quantity: Number(quantities[product.id] ?? "0"),
        }))
        .filter(
          (entry) => Number.isFinite(entry.quantity) && entry.quantity > 0,
        ),
    [products, quantities],
  );

  const subtotal = selectedItems.reduce(
    (sum, entry) => sum + entry.product.price * entry.quantity,
    0,
  );
  const total = subtotal - (Number(discount) || 0) + (Number(deliveryFee) || 0);

  useEffect(() => {
    if (
      typeof customerId === "string" &&
      customers?.some((customer) => customer.id === customerId)
    ) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId, customers]);

  const handleSave = async (createInvoice: boolean) => {
    if (!session?.user.id || !businessProfile?.id || !selectedCustomerId) {
      return;
    }

    const dueAt = dueDate.trim()
      ? new Date(`${dueDate.trim()}T12:00:00`).toISOString()
      : null;

    const result = await createOrderMutation.mutateAsync({
      user_id: session.user.id,
      business_profile_id: businessProfile.id,
      customer_id: selectedCustomerId,
      invoice_prefix: businessProfile.invoice_prefix,
      status: "confirmed",
      delivery_status: "pending",
      due_at: dueAt,
      discount: Number(discount) || 0,
      delivery_fee: Number(deliveryFee) || 0,
      notes: notes.trim() || null,
      create_invoice: createInvoice,
      items: selectedItems.map(({ product, quantity }) => ({
        product_id: product.id,
        name: product.name,
        quantity,
        unit_price: product.price,
      })),
    });

    if (createInvoice && result.invoice) {
      router.replace(`/invoices/${result.invoice.id}`);
      return;
    }

    router.replace(`/orders/${result.order.id}`);
  };

  if (customersQuery.isPending || productsQuery.isPending) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Add customer"
            onPress={() => router.push("/customers/create?redirectTo=/orders/create")}
          />
        }
        subtitle="Create a real order and invoice from your saved customers and products."
        title="Create order"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">
            Loading customers and products...
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (customersQuery.isError || productsQuery.isError) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton
            label="Add customer"
            onPress={() => router.push("/customers/create?redirectTo=/orders/create")}
          />
        }
        subtitle="Create a real order and invoice from your saved customers and products."
        title="Create order"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">
            {customersQuery.error?.message ?? productsQuery.error?.message}
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton
          label="Add customer"
          onPress={() => router.push("/customers/create?redirectTo=/orders/create")}
        />
      }
      subtitle="Create a real order and invoice from your saved customers and products."
      title="Create order"
      withBackButton
    >
      <SurfaceCard tone="primary">
        <ThemedText variant="subtitle">Fast order builder</ThemedText>
        <ThemedText variant="muted">
          Select a customer, add product quantities, set charges, then save the
          order with or without an invoice.
        </ThemedText>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Choose customer</ThemedText>
        <View style={styles.stack}>
          {customerList.length > 0 ? (
            customerList.map((customer) => (
              <ListRow
                accessory={
                  selectedCustomerId === customer.id ? (
                    <StatusPill label="selected" tone="brand" />
                  ) : undefined
                }
                key={customer.id}
                onPress={() => setSelectedCustomerId(customer.id)}
                subtitle={customer.phone}
                title={customer.full_name}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText variant="muted">
                No customers yet. Add one now, then come straight back to this
                order.
              </ThemedText>
              <ThemedButton
                label="Add customer"
                onPress={() => router.push("/customers/create?redirectTo=/orders/create")}
              />
            </View>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Select items</ThemedText>
        <View style={styles.stack}>
          {products.length > 0 ? (
            products.map((product) => (
              <SurfaceCard key={product.id} tone="muted">
                <View style={styles.productRow}>
                  <View style={styles.productCopy}>
                    <ThemedText>{product.name}</ThemedText>
                    <ThemedText variant="caption">
                      {product.category ?? "Uncategorized"} ·{" "}
                      {formatCurrency(product.price)}
                    </ThemedText>
                  </View>
                  <View style={styles.quantityInput}>
                    <ThemedInput
                      keyboardType="number-pad"
                      label="Qty"
                      onChangeText={(value) =>
                        setQuantities((current) => ({
                          ...current,
                          [product.id]: value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      placeholder="0"
                      value={quantities[product.id] ?? ""}
                    />
                  </View>
                </View>
              </SurfaceCard>
            ))
          ) : (
            <ThemedText variant="muted">
              No active products yet. Add products first, then come back to
              build an order.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <ThemedText variant="subtitle">Pricing and schedule</ThemedText>
        <ThemedInput
          keyboardType="number-pad"
          label="Discount"
          onChangeText={setDiscount}
          placeholder="0"
          value={discount}
        />
        <ThemedInput
          keyboardType="number-pad"
          label="Delivery fee"
          onChangeText={setDeliveryFee}
          placeholder="0"
          value={deliveryFee}
        />
        <ThemedInput
          label="Due date"
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          value={dueDate}
        />
        <ThemedInput
          label="Notes"
          multiline
          numberOfLines={3}
          onChangeText={setNotes}
          placeholder="Optional order notes"
          value={notes}
        />
        <View style={styles.summaryRow}>
          <ThemedText>Subtotal</ThemedText>
          <ThemedText>{formatCurrency(subtotal)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Delivery fee</ThemedText>
          <ThemedText>{formatCurrency(Number(deliveryFee) || 0)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText>Due date</ThemedText>
          <ThemedText>
            {dueDate ? formatShortDate(`${dueDate}T12:00:00`) : "Not set"}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <ThemedText style={styles.totalLabel}>
            {formatCurrency(total)}
          </ThemedText>
        </View>
      </SurfaceCard>

      {createOrderMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Order save error</ThemedText>
          <ThemedText variant="muted">
            {createOrderMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={
            !session ||
            !businessProfile ||
            !selectedCustomerId ||
            selectedItems.length === 0 ||
            createOrderMutation.isPending
          }
          label={createOrderMutation.isPending ? "Saving..." : "Save order"}
          onPress={() => {
            void handleSave(false);
          }}
        />
        <ThemedButton
          disabled={
            !session ||
            !businessProfile ||
            !selectedCustomerId ||
            selectedItems.length === 0 ||
            createOrderMutation.isPending
          }
          label={
            createOrderMutation.isPending ? "Generating..." : "Save and invoice"
          }
          onPress={() => {
            void handleSave(true);
          }}
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
  productRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  productCopy: {
    flex: 1,
    gap: 6,
  },
  quantityInput: {
    minWidth: 96,
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
  emptyState: {
    gap: 12,
  },
});
