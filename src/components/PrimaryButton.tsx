import { LinearGradient } from "expo-linear-gradient";

import { View, StyleSheet, Pressable, Text, ViewStyle } from "react-native";

import Colors from '../constants/Colors';
import FontSize from "../constants/FontSize";
import Spacing, { RADIUS, SHADOWS } from "../constants/Spacing";

export function PrimaryButton({
  title,
  onPress,
  styles
}: {
  title: string;
  onPress: Function;
  styles?: ViewStyle
}) {
  function onPressHandler() {
    onPress();
  }

  // https://www.cssfontstack.com/oldsites/hexcolortool/
  function getPrimaryColor(isPressed: boolean): string {
    return isPressed ? Colors.primaryDark : Colors.primary;
  }

  function getPrimaryGradientColor(isPressed: boolean): string {
    return isPressed ? Colors.gradientPrimaryDark : Colors.gradientPrimary;
  }

  function getShadowStyles(isPressed: boolean): ViewStyle[] {
    return isPressed
      ? [componentStyles.pressedShadowProp, componentStyles.pressedElevation]
      : [componentStyles.shadowProp, componentStyles.elevation];
  }

  return (
    <View style={styles}>
      <Pressable onPress={onPressHandler}>
        {({ pressed }) => (
          <LinearGradient
            colors={[
              getPrimaryColor(pressed),
              getPrimaryGradientColor(pressed),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              componentStyles.linearGradient,
              componentStyles.button,
              getShadowStyles(pressed),
            ]}
          >
            <Text style={componentStyles.buttonText}>{title}</Text>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

const componentStyles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.button.horizontal,
    paddingVertical: Spacing.button.vertical,
    minHeight: Spacing.touchTarget.cta,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: FontSize.button.title,
    textAlign: "center",
  },
  linearGradient: {
    borderRadius: RADIUS.md,
  },
  shadowProp: {
    ...SHADOWS.card,
  },
  pressedShadowProp: {
    ...SHADOWS.floating,
  },
  elevation: {
    elevation: 3,
  },
  pressedElevation: {
    elevation: 5,
  },
});
