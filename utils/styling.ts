import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const [shortDimension, longDimension] =
  SCREEN_WIDTH < SCREEN_HEIGHT
    ? [SCREEN_WIDTH, SCREEN_HEIGHT]
    : [SCREEN_HEIGHT, SCREEN_WIDTH];

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (shortDimension / guidelineBaseWidth) * (size as number),
    ),
  );

export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (longDimension / guidelineBaseHeight) * (size as number),
    ),
  );

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

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

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
