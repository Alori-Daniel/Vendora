import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useAppTheme } from "@/hooks/use-app-theme";
import { AppProviders } from "@/providers/app-providers";
import { AuthGate } from "@/providers/auth-gate";

export const unstable_settings = {
  anchor: "(tabs)",
};
// SplashScreen.preventAutoHideAsync();

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
        <Stack.Screen
          options={{ animation: "fade_from_bottom", animationDuration: 400 }}
          name="(tabs)"
        />
        <Stack.Screen
          // options={{ animation: "fade", animationDuration: 400 }}
          name="index"
        />
      </Stack>
    </AppProviders>
  );
}
