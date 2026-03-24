import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { radius, spacingX, spacingY, verticalScale } from "@/utils/styling";

export type ThemedInputProps = TextInputProps & {
  label?: string;
  hint?: string;
  smallRadius?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ThemedInput({
  label,
  hint,
  containerStyle,
  smallRadius = false,
  style,
  ...props
}: ThemedInputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText variant="caption" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
          smallRadius && { borderRadius: radius._6 },
          style,
        ]}
        {...props}
      />
      {hint ? (
        <ThemedText variant="caption" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacingY._7,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    minHeight: verticalScale(52),
    borderRadius: radius._15,
    borderWidth: 1,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    fontSize: 14,
  },
  hint: {
    opacity: 0.85,
  },
});
