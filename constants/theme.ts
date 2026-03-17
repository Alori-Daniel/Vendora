import { verticalScale } from "@/utils/styling";

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

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
  _70: verticalScale(70),
  _80: verticalScale(80),
  _90: verticalScale(90),
  full: 200,
};
