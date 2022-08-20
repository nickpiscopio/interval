import { LinearGradient } from "expo-linear-gradient";

import { View, StyleSheet, Pressable, Text, ViewStyle } from "react-native";

import Colors from '../constants/Colors';
import FontSize from "../constants/FontSize";
import Spacing from "../constants/Spacing";

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
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: FontSize.button.title
  },
  linearGradient: {
    borderRadius: Spacing.button.borderRadius,
  },
  shadowProp: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pressedShadowProp: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: -2, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 3,
    shadowColor: Colors.shadow,
  },
  pressedElevation: {
    elevation: 4,
    shadowColor: Colors.shadow,
  },
});
