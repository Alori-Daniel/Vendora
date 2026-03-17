import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ThemedView style={styles.container}>
        <ThemedText
          variant="muted"
          onPress={() => router.push("/(tabs)/explore")}
        >
          Hello
        </ThemedText>
        <ThemedButton label="Sample button" />
      </ThemedView>
    </SafeAreaView>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
});
