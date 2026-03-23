import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-app-theme";
import { verticalScale } from "@/utils/styling";

type TextVariant =
  | "body"
  | "muted"
  | "label"
  | "title"
  | "titleSmall"
  | "subtitle"
  | "button"
  | "caption";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = "body",
  ...props
}: ThemedTextProps) {
  const color = useThemeColor(variant === "muted" ? "textMuted" : "text", {
    light: lightColor,
    dark: darkColor,
  });

  return <Text style={[styles[variant], { color }, style]} {...props} />;
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    // lineHeight: verticalScale(24),
  },
  muted: {
    fontSize: 13,
    // lineHeight: verticalScale(22),
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    // lineHeight: verticalScale(38),
    fontWeight: "700",
  },
  titleSmall: {
    fontSize: 28,
    // lineHeight: verticalScale(34),
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 20,
    // lineHeight: verticalScale(28),
    fontWeight: "600",
  },
  button: {
    fontSize: 16,
    lineHeight: verticalScale(20),
    fontWeight: "600",
  },
  caption: {
    fontSize: 13,
    // lineHeight: verticalScale(18),
  },
});
