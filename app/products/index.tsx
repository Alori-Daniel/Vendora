import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ListRow } from "@/components/list-row";
import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useProductsQuery } from "@/hooks/use-products";
import { formatCurrency } from "@/utils/formatters";

export default function ProductsScreen() {
  const productsQuery = useProductsQuery();
  const products = productsQuery.data ?? [];

  if (productsQuery.isPending) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton label="Add product" onPress={() => router.push("/products/manage")} />
        }
        subtitle="Keep the catalog lightweight: name, price, optional SKU, and active state."
        title="Products"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">Loading products...</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  if (productsQuery.isError) {
    return (
      <ScreenShell
        headerAccessory={
          <ThemedButton label="Add product" onPress={() => router.push("/products/manage")} />
        }
        subtitle="Keep the catalog lightweight: name, price, optional SKU, and active state."
        title="Products"
        withBackButton
      >
        <SurfaceCard>
          <ThemedText variant="muted">{productsQuery.error.message}</ThemedText>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      headerAccessory={
        <ThemedButton label="Add product" onPress={() => router.push("/products/manage")} />
      }
      subtitle="Keep the catalog lightweight: name, price, optional SKU, and active state."
      title="Products"
      withBackButton
    >
      <SurfaceCard>
        <View style={styles.list}>
          {products.length > 0 ? (
            products.map((product) => (
              <ListRow
                accessory={
                  <StatusPill
                    label={product.is_active ? "active" : "inactive"}
                    tone={product.is_active ? "success" : "neutral"}
                  />
                }
                key={product.id}
                meta={formatCurrency(product.price)}
                subtitle={product.category ?? "Uncategorized"}
                title={product.name}
              />
            ))
          ) : (
            <ThemedText variant="muted">
              No products yet. Add the first one to make order creation faster.
            </ThemedText>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">MVP product rule</ThemedText>
        <ThemedText variant="muted">
          Start simple. Inventory depth can wait until the product becomes
          operationally sticky for solo vendors.
        </ThemedText>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
