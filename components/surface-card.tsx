import React, { type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { radius, spacingX, spacingY } from "@/utils/styling";

type SurfaceCardTone = "default" | "muted" | "primary";

type SurfaceCardProps = {
  tone?: SurfaceCardTone;
  style?: StyleProp<ViewStyle>;
  verticalPadding?: number;
  smallRadius?: boolean;
  children: ReactNode;
};

export function SurfaceCard({
  tone = "default",
  style,
  verticalPadding,
  smallRadius = false,
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
      style={[
        styles.card,
        { borderColor },
        style,
        verticalPadding ? { paddingVertical: verticalPadding } : {},
        smallRadius ? { borderRadius: radius._10 } : {},
      ]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius._17,
    borderWidth: 1,
    gap: spacingY._5,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._15,
  },
});
