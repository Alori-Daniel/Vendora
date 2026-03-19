import { type Href, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { StatusPill } from "@/components/status-pill";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useCreateCustomerMutation } from "@/hooks/use-customers";
import { useAppStore } from "@/stores/app-store";

export default function CreateCustomerScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const session = useAppStore((state) => state.session);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const lastError = useAppStore((state) => state.lastError);
  const createCustomerMutation = useCreateCustomerMutation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const handleSave = async () => {
    if (!session?.user.id || !businessProfile?.id) {
      return;
    }

    const customer = await createCustomerMutation.mutateAsync({
      user_id: session.user.id,
      business_profile_id: businessProfile.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      address: address.trim() || null,
      landmark: landmark.trim() || null,
      notes: notes.trim() || null,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (typeof redirectTo === "string" && redirectTo.length > 0) {
      const nextRoute =
        `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}customerId=${customer.id}`;

      router.replace(nextRoute as Href);
      return;
    }

    router.replace(`/customers/${customer.id}`);
  };

  return (
    <ScreenShell
      subtitle="Save a customer once, then reuse the profile for orders, invoices, and payment follow-up."
      title="Add customer"
      withBackButton
    >
      <SurfaceCard>
        <ThemedInput
          label="Full name"
          onChangeText={setFullName}
          placeholder="Damilola Ajayi"
          value={fullName}
        />
        <ThemedInput
          label="Phone"
          onChangeText={setPhone}
          placeholder="+234 816 440 2782"
          value={phone}
        />
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="Optional email"
          value={email}
        />
        <ThemedInput
          label="Address"
          multiline
          numberOfLines={3}
          onChangeText={setAddress}
          placeholder="Delivery address"
          value={address}
        />
        <ThemedInput
          label="Landmark"
          onChangeText={setLandmark}
          placeholder="Optional delivery landmark"
          value={landmark}
        />
        <ThemedInput
          label="Tags"
          onChangeText={setTags}
          placeholder="VIP, repeat buyer"
          value={tags}
        />
        <ThemedInput
          label="Notes"
          multiline
          numberOfLines={3}
          onChangeText={setNotes}
          placeholder="Optional customer notes"
          value={notes}
        />
      </SurfaceCard>

      {!session || !businessProfile ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Business profile required</ThemedText>
          <ThemedText variant="muted">
            Sign in and complete business setup before saving customers.
          </ThemedText>
        </SurfaceCard>
      ) : null}

      {createCustomerMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <StatusPill label="Save failed" tone="danger" />
          <ThemedText variant="muted">
            {createCustomerMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <View style={styles.actions}>
        <ThemedButton
          disabled={
            !session ||
            !businessProfile ||
            !fullName.trim() ||
            !phone.trim() ||
            createCustomerMutation.isPending
          }
          label={
            createCustomerMutation.isPending ? "Saving customer..." : "Save customer"
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
  actions: {
    gap: 12,
  },
});
