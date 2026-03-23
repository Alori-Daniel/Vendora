import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";

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
    <KeyboardAvoidingView
      behavior={"padding"}
      // keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <ScreenShell
        subtitle="Fill in your details to proceed"
        title="Welcome Back!"
        withBackButton
      >
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
            label={signInMutation.isPending ? "Signing in..." : "Sign In"}
            onPress={() => signInMutation.mutate({ email, password })}
          />
          <ThemedButton
            label="Create account"
            onPress={() => router.push("/auth/sign-up")}
            variant="secondary"
          />
        </View>

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
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
});
