import SplashLoading from "@/components/loading-splash";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/stores/app-store";
import { verticalScale } from "@/utils/styling";
import { router } from "expo-router";
import React, { useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const onboardingData = [
  {
    title: "Generate Invoice",
    description: "Create and share invoices with ease",
    image: require("../assets/IllustrationIcons/Frame.png"),
  },
  {
    title: "Track Payments",
    description: "Stay on top of every payment",
    image: require("../assets/IllustrationIcons/Frame3.png"),
  },
  {
    title: "Store Orders",
    description: "Keep everything organized in one place",
    image: require("../assets/IllustrationIcons/Frame2.png"),
  },
];

const IndexScreen = () => {
  const authStatus = useAppStore((state) => state.authStatus);
  const profileStatus = useAppStore((state) => state.profileStatus);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const setAuthLoading = useAppStore((state) => state.setAuthLoading);
  const { width, height } = useWindowDimensions();
  const { colors } = useAppTheme();
  const carouselHeight = Math.min(Math.max(height * 0.48, 360), 460);
  const imageHeight = carouselHeight * 0.78;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    // console.log("Content Offset:", contentOffset);
    const index = Math.round(contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {authStatus === "authenticated" ||
      authStatus === "loading" ||
      profileStatus === "loading" ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn} exiting={FadeOut}>
          <SplashLoading />
        </Animated.View>
      ) : (
        // <ScreenShell isPadding={false}>
        <Animated.View
          style={{
            flex: 1,
            // backgroundColor: colors.background,
            paddingVertical: verticalScale(16),
            alignItems: "center",
            // borderWidth: 1,
          }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <View style={{ width: "100%", marginBottom: verticalScale(20) }}>
            <TouchableOpacity onPress={() => router.push("/auth/sign-up")}>
              <ThemedView style={{ alignSelf: "flex-end", marginRight: 16 }}>
                <ThemedText variant="muted">Skip</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </View>

          <View
            style={{ alignItems: "center", marginBottom: verticalScale(20) }}
          >
            <View style={{ flexDirection: "row" }}>
              <ThemedText variant="title" style={{ color: "#EDA153" }}>
                V
              </ThemedText>

              <ThemedText variant="title" style={{ color: "#315C44" }}>
                endora
              </ThemedText>
            </View>
          </View>

          <View
            style={{
              height: carouselHeight,
              marginBottom: verticalScale(16),
              // borderWidth: 1,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onScroll={handleScroll}
              ref={scrollRef}
              // scrollEventThrottle={1}
            >
              {onboardingData.map((item, index) => (
                <View style={[styles.card, { width: width }]} key={index}>
                  <Image
                    source={item.image}
                    style={{ width: width * 0.9, height: imageHeight }}
                  />
                  <View style={{ alignItems: "center" }}>
                    <ThemedText
                      variant="title"
                      style={{ color: colors.primary }}
                    >
                      {item.title}
                    </ThemedText>
                    <ThemedText
                      variant="caption"
                      style={{ color: colors.text }}
                    >
                      {item.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: verticalScale(16),
            }}
          >
            {onboardingData.map((_, index) => (
              <View key={index}>
                <ThemedView
                  style={{
                    width: 20,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      activeIndex === index ? colors.primary : colors.textMuted,
                  }}
                  // lightColor="green"
                  // darkColor=""
                />
              </View>
            ))}
          </View>

          <View
            style={{
              flex: 1,
              // borderWidth: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 16,
            }}
          >
            <ThemedButton
              style={{ width: width * 0.9 }}
              label="Get Started"
              onPress={() => router.push("/auth/sign-up")}
            />
            <View style={{ flexDirection: "row", gap: 4 }}>
              <ThemedText>Already have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
                <ThemedText style={{ color: colors.primary }}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  hero: {
    gap: 18,
  },
  heroTitle: {
    maxWidth: 320,
  },
  ctaGroup: {
    gap: 12,
  },
  inlineLink: {
    fontWeight: "600",
  },
  card: {
    alignItems: "center",
    gap: 8,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureList: {
    gap: 10,
  },
});
