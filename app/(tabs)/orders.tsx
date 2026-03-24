import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useOrdersQuery } from "@/hooks/use-workspace";
import { formatCurrency } from "@/utils/formatters";
import { radius, spacingY, verticalScale } from "@/utils/styling";
import { getOrderStatusTone, getStatusLabel } from "@/utils/vendor-status";
import { Ionicons } from "@expo/vector-icons";

export default function OrdersScreen() {
  const ordersQuery = useOrdersQuery();
  const orderRows = ordersQuery.data?.orders;
  const orders = React.useMemo(() => orderRows ?? [], [orderRows]);
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { colors } = useAppTheme();

  const orderStatus = [
    { label: "All", value: "all" },
    { label: "Pending", value: "in_progress" },
    { label: "Dispatched", value: "out_for_delivery" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Delivered", value: "delivered" },
  ];

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchableOrders = React.useMemo(
    () =>
      orders.map((order) => ({
        order,
        searchText: [
          order.order_number,
          order.customer?.full_name,
          order.invoice?.invoice_number,
          order.notes,
        ]
          .filter(Boolean)
          .join("\n")
          .toLowerCase(),
      })),
    [orders],
  );
  console.log("searcha", searchableOrders);

  const filteredOrders = React.useMemo(() => {
    const statusFilteredOrders =
      selectedStatus === "all"
        ? searchableOrders
        : searchableOrders.filter(
            ({ order }) => order.status === selectedStatus,
          );

    if (!normalizedSearchQuery) {
      return statusFilteredOrders.map(({ order }) => order);
    }

    return statusFilteredOrders
      .filter(({ searchText }) => searchText.includes(normalizedSearchQuery))
      .map(({ order }) => order);
  }, [normalizedSearchQuery, searchableOrders, selectedStatus]);

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
      scrollable={false}
      // headerAccessory={
      //   <ThemedButton
      //     label="New order"
      //     onPress={() => router.push("/orders/create")}
      //   />
      // }
      // subtitle="Capture and follow every order from DM to delivery."
      // title="Orders"
      // contentContainerStyle={{ borderWidth: 1 }}
    >
      <View style={styles.header}>
        <ThemedText variant="titleSmall">Orders</ThemedText>
        {/* <ThemedText variant="muted">
          Capture and follow every order from DM to delivery.
        </ThemedText> */}
      </View>

      <View style={{ gap: 12 }}>
        <ThemedInput
          placeholder="Search orders"
          smallRadius
          onChangeText={setSearchQuery}
          style={{ minHeight: verticalScale(44) }}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{ gap: 4 }}
          showsHorizontalScrollIndicator={false}
        >
          {orderStatus.map((status) => (
            <Pressable
              onPress={() => setSelectedStatus(status.value)}
              key={status.value}
            >
              <StatusPill
                label={status.label}
                tone={status.value === selectedStatus ? "brand" : "neutral"}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {/* <View style={styles.metrics}>
        <SurfaceCard style={styles.metricCard} tone="muted">
          <ThemedText variant="caption">Open orders</ThemedText>
          <ThemedText style={styles.metricValue}>{openOrders}</ThemedText>
        </SurfaceCard>
        <SurfaceCard style={styles.metricCard}>
          <ThemedText variant="caption">Awaiting payment</ThemedText>
          <ThemedText style={styles.metricValue}>{unpaidOrders}</ThemedText>
        </SurfaceCard>
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 6 }}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <ListRow
              accessory={
                <StatusPill
                  label={getStatusLabel(order.status)}
                  tone={getOrderStatusTone(order.status)}
                />
              }
              key={order.id}
              meta={formatCurrency(order.subtotal)}
              onPress={() => router.push(`/orders/${order.id}`)}
              // subtitle={
              //   order.due_at
              //     ? `Due ${formatShortDate(order.due_at)}`
              //     : "No due date"
              // }
              subtitle={`${order.customer?.full_name ?? "Walk-in customer"}`}
              title={`${order.order_number}`}
            />
          ))
        ) : (
          <ThemedText style={{ textAlign: "center" }} variant="muted">
            No{" "}
            {selectedStatus === "all"
              ? ""
              : orderStatus.find((s) => s.value === selectedStatus)?.label}{" "}
            Orders yet. Use the New order flow to start tracking sales.
          </ThemedText>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/orders/create")}
        style={({ pressed }) => [
          styles.quickActionItem,
          { opacity: pressed ? 0.82 : 1 },
        ]}
      >
        <View
          style={[
            styles.quickActionIconWrap,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons color={colors.onPrimary} name="add" size={31} />
        </View>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    // borderWidth: 1,
  },
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
    gap: 6,
  },
  quickActionItem: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    flex: 1,
    gap: spacingY._5,
    minWidth: 68,
    // borderWidth: 1,
  },
  quickActionIconWrap: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 53,
    justifyContent: "center",
    width: 53,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
