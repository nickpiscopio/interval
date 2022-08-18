import { LinearGradient } from "expo-linear-gradient";

import { View, StyleSheet, Pressable, Text, ViewStyle } from "react-native";

import Colors from '../constants/Colors';
import Spacing from "../constants/Spacing";

export function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: Function;
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
      ? [styles.pressedShadowProp, styles.pressedElevation]
      : [styles.shadowProp, styles.elevation];
  }

  return (
    <View>
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
              styles.linearGradient,
              styles.button,
              getShadowStyles(pressed),
            ]}
          >
            <Text style={styles.buttonText}>{title}</Text>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.button.horizontal,
    paddingVertical: Spacing.button.vertical,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
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
