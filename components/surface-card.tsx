import React, { type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { radius, spacingX, spacingY } from "@/utils/styling";

type SurfaceCardTone = "default" | "muted" | "primary";

type SurfaceCardProps = {
  tone?: SurfaceCardTone;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function SurfaceCard({
  tone = "default",
  style,
  children,
}: SurfaceCardProps) {
  const { colors } = useAppTheme();

  const backgroundColor =
    tone === "primary"
      ? colors.primaryMuted
      : tone === "muted"
        ? colors.surfaceMuted
        : colors.surface;

  const borderColor = tone === "primary" ? colors.primaryMuted : colors.border;

  return (
    <ThemedView
      darkColor={backgroundColor}
      lightColor={backgroundColor}
      style={[styles.card, { borderColor }, style]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius._20,
    borderWidth: 1,
    gap: spacingY._12,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._15,
  },
});
