import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";

const ExploreScreen = () => {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ThemedView style={styles.container}>
        <ThemedText>Hello</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ExploreScreen;

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
  list: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  swatch: {
    height: 48,
    width: 48,
    borderRadius: 16,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
});
