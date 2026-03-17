import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";

const HomeScreen = () => {
  const router = useRouter();
  const { colors, theme } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ThemedView style={styles.container}>
        <ThemedText>Hello There</ThemedText>
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
