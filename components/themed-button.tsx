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

  const backgroundColor = variant === "primary" ? colors.primary : colors.surface;
  const borderColor = variant === "primary" ? colors.primary : colors.border;
  const textColor = variant === "primary" ? colors.onPrimary : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}
    >
      <ThemedText
        variant="button"
        lightColor={textColor}
        darkColor={textColor}
        style={labelStyle}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
});
