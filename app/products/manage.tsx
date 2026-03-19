import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useCreateProductMutation } from "@/hooks/use-products";
import { useAppStore } from "@/stores/app-store";

export default function ProductManageScreen() {
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const createProductMutation = useCreateProductMutation();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSave = async () => {
    if (!session?.user.id || !businessProfile?.id) {
      return;
    }

    await createProductMutation.mutateAsync({
      user_id: session.user.id,
      business_profile_id: businessProfile.id,
      name: name.trim(),
      sku: sku.trim() || null,
      price: Number(price) || 0,
      category: category.trim() || null,
      image_url: imageUrl.trim() || null,
      is_active: isActive,
    });

    router.replace("/products");
  };

  return (
    <ScreenShell
      subtitle="One lightweight screen for add and edit keeps catalog management fast."
      title="Add or edit product"
      withBackButton
    >
      <SurfaceCard>
        <ThemedInput
          label="Product name"
          onChangeText={setName}
          placeholder="Satin Two-Piece Set"
          value={name}
        />
        <ThemedInput
          label="SKU"
          onChangeText={setSku}
          placeholder="STN-103"
          value={sku}
        />
        <ThemedInput
          keyboardType="numeric"
          label="Price"
          onChangeText={setPrice}
          placeholder="28500"
          value={price}
        />
        <ThemedInput
          label="Category"
          onChangeText={setCategory}
          placeholder="Lounge wear"
          value={category}
        />
        <ThemedInput
          label="Photo URL"
          onChangeText={setImageUrl}
          placeholder="Optional product image"
          value={imageUrl}
        />
        <View style={styles.statusRow}>
          <ThemedText variant="caption">Product status</ThemedText>
          <View style={styles.statusActions}>
            <ThemedButton
              label="Active"
              onPress={() => setIsActive(true)}
              style={styles.statusButton}
              variant={isActive ? "primary" : "secondary"}
            />
            <ThemedButton
              label="Inactive"
              onPress={() => setIsActive(false)}
              style={styles.statusButton}
              variant={!isActive ? "primary" : "secondary"}
            />
          </View>
          <StatusPill
            label={isActive ? "active" : "inactive"}
            tone={isActive ? "success" : "neutral"}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <ThemedText variant="muted">
          Product photos and inventory count can stay optional in V1. Price and
          active state are the only fields that need to be fast.
        </ThemedText>
      </SurfaceCard>

      {createProductMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Save error</ThemedText>
          <ThemedText variant="muted">
            {createProductMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={
            !session ||
            !businessProfile ||
            !name ||
            !price ||
            createProductMutation.isPending
          }
          label={createProductMutation.isPending ? "Saving product..." : "Save product"}
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
  actions: {
    gap: 12,
  },
  statusButton: {
    flex: 1,
  },
  statusRow: {
    gap: 10,
  },
  statusActions: {
    flexDirection: "row",
    gap: 12,
  },
});
