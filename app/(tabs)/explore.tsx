import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";

const ExploreScreen = () => {
  const { colors } = useAppTheme();
  const palette = [
    { name: "Background", value: colors.background },
    { name: "Surface", value: colors.surface },
    { name: "Surface muted", value: colors.surfaceMuted },
    { name: "Primary", value: colors.primary },
    { name: "Text", value: colors.text },
    { name: "Text muted", value: colors.textMuted },
    { name: "Border", value: colors.border },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <ThemedText variant="title">Theme preview</ThemedText>
        <ThemedText variant="muted">
          These semantic tokens come from one constants file, so future screens can stay
          consistent without hardcoded colors.
        </ThemedText>

        <View style={styles.list}>
          {palette.map((item) => (
            <ThemedView
              key={item.name}
              lightColor={colors.surface}
              darkColor={colors.surface}
              style={[styles.row, { borderColor: colors.border }]}
            >
              <ThemedView
                lightColor={item.value}
                darkColor={item.value}
                style={[
                  styles.swatch,
                  item.name === "Background" || item.name === "Surface muted"
                    ? { borderColor: colors.border, borderWidth: 1 }
                    : undefined,
                ]}
              />
              <View style={styles.meta}>
                <ThemedText variant="subtitle">{item.name}</ThemedText>
                <ThemedText variant="muted">{item.value}</ThemedText>
              </View>
            </ThemedView>
          ))}
        </View>
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
