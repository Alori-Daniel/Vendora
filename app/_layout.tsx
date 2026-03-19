import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useAppTheme } from "@/hooks/use-app-theme";
import { AuthGate } from "@/providers/auth-gate";
import { AppProviders } from "@/providers/app-providers";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <AppProviders>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
    </AppProviders>
  );
}
