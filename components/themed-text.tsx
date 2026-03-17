import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-app-theme";

type TextVariant = "body" | "muted" | "label" | "title" | "subtitle" | "button";

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
    lineHeight: 24,
  },
  muted: {
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
});
