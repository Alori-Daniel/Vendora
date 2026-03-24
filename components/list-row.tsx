import { Ionicons } from "@expo/vector-icons";
import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { radius, spacingX, spacingY } from "@/utils/styling";

type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accessory?: ReactNode;
  onPress?: () => void;
};

export function ListRow({
  title,
  subtitle,
  meta,
  icon = "chevron-forward",
  accessory,
  onPress,
}: ListRowProps) {
  const { colors } = useAppTheme();
  const baseStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  const content = (
    <>
      <View style={styles.copy}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText variant="caption">{subtitle}</ThemedText>
        ) : null}
      </View>

      <View style={styles.accessoryContainer}>
        {accessory}

        {meta ? (
          <ThemedText variant="label" style={styles.meta}>
            {meta}
          </ThemedText>
        ) : null}
      </View>

      {/* {onPress ? (
        <Ionicons color={colors.textMuted} name={icon} size={18} />
      ) : null} */}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          baseStyle,
          { opacity: pressed ? 0.84 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, baseStyle]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: radius._10,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacingX._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._15,
  },
  copy: {
    flex: 1,
    gap: spacingY._5,
  },
  title: {
    fontWeight: "600",
  },
  meta: {
    textAlign: "center",
  },
  accessoryContainer: {
    alignItems: "center",
    gap: spacingY._5,
  },
});
