import { Ionicons } from "@expo/vector-icons";
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
import { useCustomersQuery } from "@/hooks/use-workspace";
import { formatCurrency } from "@/utils/formatters";
import { radius, spacingY, verticalScale } from "@/utils/styling";

export default function CustomersScreen() {
  const customersQuery = useCustomersQuery();
  const customerRows = customersQuery.data?.customers;
  const customers = React.useMemo(() => customerRows ?? [], [customerRows]);
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const totalOutstanding = customers.reduce(
    (total, customer) => total + customer.outstandingBalance,
    0,
  );
  const customersWithOutstandingBalance = customers.filter(
    (customer) => customer.outstandingBalance > 0,
  ).length;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchableCustomers = React.useMemo(
    () =>
      customers.map((customer) => ({
        customer,
        searchText: [
          customer.full_name,
          customer.phone,
          customer.email,
          customer.address,
          customer.notes,
          customer.tags.join(" "),
        ]
          .filter(Boolean)
          .join("\n")
          .toLowerCase(),
      })),
    [customers],
  );

  const filteredCustomers = React.useMemo(() => {
    if (!normalizedSearchQuery) {
      return searchableCustomers.map(({ customer }) => customer);
    }

    return searchableCustomers
      .filter(({ searchText }) => searchText.includes(normalizedSearchQuery))
      .map(({ customer }) => customer);
  }, [normalizedSearchQuery, searchableCustomers]);

  if (customersQuery.isPending) {
    return (
      <ScreenShell
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
        subtitle="Customer profiles, balances, notes, and repeat-order history."
        title="Customers"
      >
        <SurfaceCard>
          <ThemedText variant="muted">
            {customersQuery.error.message}
          </ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollable={false}>
      <View style={styles.header}>
        <ThemedText variant="titleSmall">Customers</ThemedText>
      </View>

      <View style={styles.searchArea}>
        <ThemedInput
          onChangeText={setSearchQuery}
          placeholder="Search customers"
          smallRadius
          style={{ minHeight: verticalScale(44) }}
          value={searchQuery}
        />
      </View>

      <SurfaceCard tone="muted">
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <ThemedText variant="caption">Total customers</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {customers.length}
            </ThemedText>
            <ThemedText variant="muted">
              {customersWithOutstandingBalance} with open balances
            </ThemedText>
          </View>

          <View style={styles.summaryBlock}>
            <ThemedText variant="caption">Outstanding</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatCurrency(totalOutstanding)}
            </ThemedText>
            <ThemedText variant="muted">
              Across all customer balances
            </ThemedText>
          </View>
        </View>
      </SurfaceCard>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
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
              subtitle={`${customer.phone} · ${customer.orderCount} order${
                customer.orderCount === 1 ? "" : "s"
              }`}
              title={customer.full_name}
            />
          ))
        ) : (
          <ThemedText style={styles.emptyStateText} variant="muted">
            {normalizedSearchQuery
              ? "No customers match that search yet."
              : "No customers yet. Add the first one to start tracking repeat buyers."}
          </ThemedText>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/customers/create")}
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
          <Ionicons
            color={colors.onPrimary}
            name="person-add-outline"
            size={24}
          />
        </View>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  searchArea: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  summaryBlock: {
    flex: 1,
    gap: 6,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  scrollArea: {
    flex: 1,
  },
  list: {
    gap: 6,
    paddingBottom: 92,
  },
  emptyStateText: {
    paddingTop: 20,
    textAlign: "center",
  },
  quickActionItem: {
    alignItems: "center",
    bottom: 20,
    gap: spacingY._5,
    minWidth: 68,
    position: "absolute",
    right: 20,
  },
  quickActionIconWrap: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 53,
    justifyContent: "center",
    width: 53,
  },
});
