import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { verticalScale } from "@/utils/styling";

type ButtonVariant = "primary" | "secondary";

export type ThemedButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function ThemedButton({
  label,
  variant = "primary",
  disabled,
  style,
  labelStyle,
  ...props
}: ThemedButtonProps) {
  const { colors } = useAppTheme();

  const palette =
    variant === "primary"
      ? {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.onPrimary,
        }
      : {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          textColor: colors.text,
        };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}
    >
      <ThemedText
        variant="button"
        lightColor={palette.textColor}
        darkColor={palette.textColor}
        style={labelStyle}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: verticalScale(52),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
});
