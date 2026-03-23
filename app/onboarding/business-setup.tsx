import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import {
  recommendedBusinessCategories,
  type RecommendedBusinessCategory,
} from "@/constants/business";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useUpsertBusinessProfileMutation } from "@/hooks/use-business-profile";
import { useAppStore } from "@/stores/app-store";

export default function BusinessSetupScreen() {
  const { colors } = useAppTheme();
  const session = useAppStore((state) => state.session);
  const lastError = useAppStore((state) => state.lastError);
  const upsertBusinessProfileMutation = useUpsertBusinessProfileMutation();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("NGN");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [businessAddress, setBusinessAddress] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<RecommendedBusinessCategory>(recommendedBusinessCategories[0]);

  const handleSave = async () => {
    if (!session?.user.id) {
      return;
    }

    await upsertBusinessProfileMutation.mutateAsync({
      user_id: session.user.id,
      business_name: businessName.trim(),
      business_category: selectedCategory,
      phone: phone.trim(),
      default_currency: defaultCurrency.trim().toUpperCase(),
      invoice_prefix: invoicePrefix.trim().toUpperCase(),
      business_address: businessAddress.trim(),
      bank_details: bankDetails.trim(),
    });

    router.replace("/(tabs)");
  };

  return (
    <ScreenShell
      subtitle="Fill in business details"
      title="Business setup"
      withBackButton
    >
      <ThemedInput
        label="Business name"
        onChangeText={setBusinessName}
        placeholder="Atelier by Nena"
        value={businessName}
      />
      <ThemedInput
        label="Phone"
        onChangeText={setPhone}
        placeholder="+234 803 000 9921"
        value={phone}
      />
      <ThemedInput
        label="Default currency"
        onChangeText={setDefaultCurrency}
        placeholder="NGN"
        value={defaultCurrency}
      />
      <ThemedInput
        label="Invoice prefix"
        onChangeText={setInvoicePrefix}
        placeholder="ATL"
        value={invoicePrefix}
      />
      <ThemedInput
        label="Business address"
        multiline
        numberOfLines={3}
        onChangeText={setBusinessAddress}
        placeholder="12 Admiralty Way, Lekki Phase 1, Lagos"
        value={businessAddress}
      />
      <ThemedInput
        label="Bank details"
        onChangeText={setBankDetails}
        placeholder="Providus Bank 0123456789"
        value={bankDetails}
      />

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">Choose your category</ThemedText>
        <View style={styles.categories}>
          {recommendedBusinessCategories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    category === selectedCategory
                      ? colors.primaryMuted
                      : colors.surface,
                  borderColor:
                    category === selectedCategory
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <ThemedText
                darkColor={
                  category === selectedCategory ? colors.primary : colors.text
                }
                lightColor={
                  category === selectedCategory ? colors.primary : colors.text
                }
                variant="caption"
              >
                {category}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      {!session ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Sign-in required</ThemedText>
          <ThemedText variant="muted">
            Create or sign into a Supabase account before saving the business
            profile.
          </ThemedText>
        </SurfaceCard>
      ) : null}

      {upsertBusinessProfileMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <StatusPill label="Save failed" tone="danger" />
          <ThemedText variant="muted">
            {upsertBusinessProfileMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <ThemedButton
        disabled={
          !session ||
          !businessName ||
          !invoicePrefix ||
          upsertBusinessProfileMutation.isPending
        }
        label={
          upsertBusinessProfileMutation.isPending
            ? "Saving profile..."
            : "Save business profile"
        }
        onPress={() => {
          void handleSave();
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
