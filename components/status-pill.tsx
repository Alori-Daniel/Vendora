import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { radius, spacingX, spacingY } from "@/utils/styling";

export type StatusTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  const { colors } = useAppTheme();

  const palette =
    tone === "brand"
      ? {
          background: colors.primaryMuted,
          text: colors.primary,
          border: colors.primaryMuted,
        }
      : tone === "success"
        ? {
            background: colors.successMuted,
            text: colors.success,
            border: colors.successMuted,
          }
        : tone === "warning"
          ? {
              background: colors.warningMuted,
              text: colors.warning,
              border: colors.warningMuted,
            }
          : tone === "danger"
            ? {
                background: colors.dangerMuted,
                text: colors.danger,
                border: colors.dangerMuted,
              }
            : tone === "info"
              ? {
                  background: colors.infoMuted,
                  text: colors.info,
                  border: colors.infoMuted,
                }
              : {
                  background: colors.surfaceMuted,
                  text: colors.textMuted,
                  border: colors.surfaceMuted,
                };

  return (
    <ThemedView
      darkColor={palette.background}
      lightColor={palette.background}
      style={[styles.pill, { borderColor: palette.border }]}
    >
      <ThemedText
        darkColor={palette.text}
        lightColor={palette.text}
        style={styles.label}
      >
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "capitalize",
  },
});
