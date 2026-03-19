import { StyleSheet } from "react-native";

import { SurfaceCard } from "@/components/surface-card";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { spacingY } from "@/utils/styling";

type MetricTone = "default" | "brand" | "success" | "warning";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: MetricTone;
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
}: MetricCardProps) {
  const { colors } = useAppTheme();

  const valueColor =
    tone === "brand"
      ? colors.primary
      : tone === "success"
        ? colors.success
        : tone === "warning"
          ? colors.warning
          : colors.text;

  const cardTone = tone === "brand" ? "primary" : tone === "default" ? "default" : "muted";

  return (
    <SurfaceCard style={styles.card} tone={cardTone}>
      <ThemedText variant="caption">{label}</ThemedText>
      <ThemedText
        darkColor={valueColor}
        lightColor={valueColor}
        style={styles.value}
      >
        {value}
      </ThemedText>
      {helper ? <ThemedText variant="caption">{helper}</ThemedText> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacingY._7,
    minWidth: 148,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
  },
});
