import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";

const HomeScreen = () => {
  const router = useRouter();
  const { colors, theme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <ThemedView
          lightColor={colors.primaryMuted}
          darkColor={colors.primaryMuted}
          style={styles.badge}
        >
          <ThemedText
            variant="label"
            lightColor={colors.primary}
            darkColor={colors.primary}
          >
            Active theme
          </ThemedText>
          <ThemedText variant="subtitle">
            {theme === "dark" ? "Dark" : "Light"} mode
          </ThemedText>
        </ThemedView>

        <ThemedText variant="title">One palette for the whole app.</ThemedText>
        <ThemedText variant="muted">
          Shared color tokens now drive your text, surfaces, and buttons so changing the
          theme happens in one place.
        </ThemedText>

        <ThemedView
          lightColor={colors.surface}
          darkColor={colors.surface}
          style={[styles.card, { borderColor: colors.border }]}
        >
          <ThemedText variant="subtitle">Reusable primitives</ThemedText>
          <ThemedText variant="muted">
            `ThemedView`, `ThemedText`, and `ThemedButton` automatically resolve the
            right colors for light and dark mode.
          </ThemedText>

          <View style={styles.swatches}>
            <ThemedView
              lightColor={colors.primary}
              darkColor={colors.primary}
              style={styles.swatch}
            />
            <ThemedView
              lightColor={colors.surfaceMuted}
              darkColor={colors.surfaceMuted}
              style={[styles.swatch, { borderColor: colors.border, borderWidth: 1 }]}
            />
            <ThemedView
              lightColor={colors.background}
              darkColor={colors.background}
              style={[styles.swatch, { borderColor: colors.border, borderWidth: 1 }]}
            />
          </View>
        </ThemedView>

        <View style={styles.actions}>
          <ThemedButton label="Preview the palette" onPress={() => router.push("/explore")} />
          <ThemedButton label="Secondary button" variant="secondary" />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 16,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  swatches: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  swatch: {
    height: 44,
    width: 44,
    borderRadius: 14,
  },
  actions: {
    gap: 12,
    marginTop: "auto",
  },
});
