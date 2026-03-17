import { useColorScheme } from "react-native";

import {
  themeColors,
  type ThemeColors,
  type ThemeName,
} from "@/constants/theme";

type ThemeOverride = Partial<Record<ThemeName, string>>;

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const theme: ThemeName = colorScheme === "dark" ? "dark" : "light";

  return {
    theme,
    colors: themeColors[theme],
    isDark: theme === "dark",
  };
}

export function useThemeColor(
  colorName: keyof ThemeColors,
  overrides?: ThemeOverride,
) {
  const { colors, theme } = useAppTheme();

  return overrides?.[theme] ?? colors[colorName];
}
