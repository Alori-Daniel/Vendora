import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useSignInMutation } from "@/hooks/use-auth";
import { hasSupabaseConfig } from "@/lib/env";
import { useAppStore } from "@/stores/app-store";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signInMutation = useSignInMutation();
  const lastError = useAppStore((state) => state.lastError);

  return (
    <ScreenShell
      subtitle="Email, magic link, or a lightweight phone-first flow can sit here later."
      title="Sign in"
      withBackButton
    >
      <SurfaceCard>
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="owner@yourstore.com"
          value={email}
        />
        <ThemedInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
        />
        <View style={styles.actions}>
          <ThemedButton
            disabled={!email || !password || signInMutation.isPending}
            label={
              signInMutation.isPending ? "Signing in..." : "Open workspace"
            }
            onPress={() => signInMutation.mutate({ email, password })}
          />
          <ThemedButton
            label="Create account"
            onPress={() => router.push("/auth/sign-up")}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {!hasSupabaseConfig ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Supabase config needed</ThemedText>
          <ThemedText variant="muted">
            Add your Supabase URL and anon key to `.env` using `.env.example`
            before testing sign-in.
          </ThemedText>
        </SurfaceCard>
      ) : null}

      {signInMutation.error || lastError ? (
        <SurfaceCard tone="muted">
          <ThemedText variant="subtitle">Sign-in error</ThemedText>
          <ThemedText variant="muted">
            {signInMutation.error?.message ?? lastError}
          </ThemedText>
        </SurfaceCard>
      ) : null}

      <SurfaceCard tone="muted">
        <ThemedText variant="subtitle">Why vendors come back</ThemedText>
        <ThemedText variant="muted">
          The first screen after sign-in shows open orders, unpaid balances, and
          the quickest next action to keep the business moving.
        </ThemedText>
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
});
