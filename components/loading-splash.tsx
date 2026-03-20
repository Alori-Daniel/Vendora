import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const SplashLoading = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#006238",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Image
        style={{ opacity, height: 250, width: 250 }}
        resizeMode="contain"
        source={require("../assets/images/splash-icon-light.png")}
      />
    </View>
  );
};

export default SplashLoading;
