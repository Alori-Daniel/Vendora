import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/use-app-theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...props }: ThemedViewProps) {
  const backgroundColor = useThemeColor("background", {
    light: lightColor,
    dark: darkColor,
  });

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
