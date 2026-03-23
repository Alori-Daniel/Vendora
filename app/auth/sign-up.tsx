import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { SurfaceCard } from "@/components/surface-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useSignUpMutation } from "@/hooks/use-auth";
import { hasSupabaseConfig } from "@/lib/env";
import { useAppStore } from "@/stores/app-store";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const signUpMutation = useSignUpMutation();
  const lastError = useAppStore((state) => state.lastError);

  const handleSubmit = async () => {
    const result = await signUpMutation.mutateAsync({
      fullName,
      email,
      password,
    });

    if (!result.session) {
      setConfirmationMessage(
        "Account created. Check your email for the confirmation link, then sign in.",
      );
      return;
    }

    router.replace("/onboarding/business-setup");
  };

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      // keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <ScreenShell
        subtitle="Fill in your details to get started."
        title="Create account"
        withBackButton
      >
        <ThemedInput
          label="Full name"
          onChangeText={setFullName}
          placeholder="Nnenna Okafor"
          value={fullName}
        />
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Business email"
          onChangeText={setEmail}
          placeholder="hello@atelierbynena.com"
          value={email}
        />
        <ThemedInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
          value={password}
        />
        <View style={styles.actions}>
          <ThemedButton
            disabled={
              !fullName || !email || !password || signUpMutation.isPending
            }
            label={
              signUpMutation.isPending ? "Creating account..." : "Register"
            }
            onPress={() => {
              void handleSubmit();
            }}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ThemedText style={styles.link} variant="caption">
              Already have an account?
            </ThemedText>

            <ThemedText
              onPress={() => router.push("/auth/sign-in")}
              style={styles.link}
              variant="caption"
            >
              Sign in
            </ThemedText>
          </View>
        </View>
        {/* </SurfaceCard> */}

        {!hasSupabaseConfig ? (
          <SurfaceCard tone="muted">
            <ThemedText variant="subtitle">Supabase config needed</ThemedText>
            <ThemedText variant="muted">
              Add your Supabase URL and anon key to `.env` using `.env.example`
              before testing sign-up.
            </ThemedText>
          </SurfaceCard>
        ) : null}

        {confirmationMessage ? (
          <SurfaceCard tone="muted">
            <ThemedText variant="subtitle">Next step</ThemedText>
            <ThemedText variant="muted">{confirmationMessage}</ThemedText>
          </SurfaceCard>
        ) : null}

        {signUpMutation.error || lastError ? (
          <SurfaceCard tone="muted">
            <ThemedText variant="subtitle">Sign-up error</ThemedText>
            <ThemedText variant="muted">
              {signUpMutation.error?.message ?? lastError}
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
  link: {
    fontWeight: "400",
    textAlign: "center",
  },
});
