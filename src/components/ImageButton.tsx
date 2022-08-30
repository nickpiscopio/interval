import { View, ViewStyle, Pressable, StyleSheet } from "react-native";

import { IntervalImage } from "../enum/IntervalImage";
import { LinearGradient } from "expo-linear-gradient";
import Spacing from "../constants/Spacing";
import { IntervalImageGradient } from "../enum/IntervalImageGradient";
import Colors from "../constants/Colors";

export function ImageButton({
  intervalImage,
  gradientColors,
  backgroundColor,
  onPress,
  style,
}: {
  intervalImage: IntervalImage;
  gradientColors?: string[];
  backgroundColor?: string;
  onPress: Function;
  style?: ViewStyle | ViewStyle[];
}) {
  function onPressHandler() {
    onPress();
  }

  function getBackgroundColor(): string {
    return backgroundColor
      ? backgroundColor
      : Colors.background.button.image.unpressed;
  }

  function getGradientColors(): string[] {
    return gradientColors
      ? gradientColors
      : IntervalImageGradient.colors.transparent.asStrings;
  }

  function getButtonView() {
    return (
      <View style={[styles.image, { backgroundColor: getBackgroundColor() }]}>
        {intervalImage}
      </View>
    );
  }

  return (
    <View style={style}>
      <Pressable onPress={onPressHandler}>
        {({ pressed }) => (
          <View
            style={[
              styles.unpressedBackground,
              pressed && styles.pressedBackground,
            ]}
          >
            <LinearGradient
              colors={getGradientColors()}
              start={IntervalImageGradient.start}
              end={IntervalImageGradient.end}
              style={[
                styles.gradient,
                { display: gradientColors ? "flex" : "none" },
              ]}
            >
              {getButtonView()}
            </LinearGradient>
            {!gradientColors && getButtonView()}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  unpressedBackground: {
    opacity: 1,
    // backgroundColor: Colors.background.button.image.pressedFullOpacity,
    borderRadius: Spacing.button.borderRadius,
  },
  pressedBackground: {
    opacity: 0.8,
  },
  gradient: {
    borderRadius: Spacing.button.borderRadius,
  },
  image: {
    // backgroundColor: Colors.background.button.image.transparent,
    borderRadius: Spacing.button.borderRadius,
    margin: 3,
    padding: 10,
  },
});
