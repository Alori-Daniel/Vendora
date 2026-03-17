export const themeColors = {
  light: {
    background: "#F7F8FC",
    surface: "#FFFFFF",
    surfaceMuted: "#EEF2FF",
    text: "#111827",
    textMuted: "#6B7280",
    primary: "#0F766E",
    primaryMuted: "#CCFBF1",
    onPrimary: "#F8FAFC",
    border: "#D9E0EC",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#0F766E",
  },
  dark: {
    background: "#0B1220",
    surface: "#111827",
    surfaceMuted: "#172036",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    primary: "#2DD4BF",
    primaryMuted: "#123B39",
    onPrimary: "#042F2E",
    border: "#243247",
    tabIconDefault: "#64748B",
    tabIconSelected: "#2DD4BF",
  },
} as const;

export type ThemeName = keyof typeof themeColors;
export type ThemeColors = (typeof themeColors)[ThemeName];
