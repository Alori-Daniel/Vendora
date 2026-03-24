import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { spacingX, spacingY } from "@/utils/styling";

type ScreenShellProps = {
  title?: string;
  subtitle?: string;
  smallTitle?: boolean;
  eyebrow?: string;
  withBackButton?: boolean;
  headerAccessory?: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  isPadding?: boolean;
  isRelative?: boolean;
  children: ReactNode;
};

export function ScreenShell({
  title,
  subtitle,
  smallTitle = false,
  isRelative = false,
  eyebrow,
  isPadding = true,
  withBackButton = false,
  headerAccessory,
  scrollable = true,
  contentContainerStyle,
  children,
}: ScreenShellProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const header =
    title || subtitle || eyebrow || withBackButton || headerAccessory ? (
      <View style={styles.header}>
        <View style={styles.headerMain}>
          {withBackButton ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }

                router.replace("/");
              }}
              style={[
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
          ) : null}

          <View style={styles.headerCopy}>
            {eyebrow ? (
              <ThemedText variant="label" style={styles.eyebrow}>
                {eyebrow}
              </ThemedText>
            ) : null}
            {title ? (
              <ThemedText variant={smallTitle ? "titleSmall" : "title"}>
                {title}
              </ThemedText>
            ) : null}
            {subtitle ? (
              <ThemedText variant="muted">{subtitle}</ThemedText>
            ) : null}
          </View>
        </View>
        {headerAccessory ? <View>{headerAccessory}</View> : null}
      </View>
    ) : null;

  return (
    <View
      style={[
        styles.safeArea,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            isPadding && styles.content,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            { flex: 1 },
            isPadding && styles.content,
            contentContainerStyle,
          ]}
        >
          {header}
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: "relative",
  },
  content: {
    gap: spacingY._15,
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._7,
    paddingBottom: spacingY._40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacingX._12,
  },
  headerMain: {
    flex: 1,
    gap: spacingY._12,
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._10,
  },
  headerCopy: {
    gap: spacingY._7,
  },
  eyebrow: {
    letterSpacing: 0.4,
  },
});
