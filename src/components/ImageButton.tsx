import { View, ViewStyle, Pressable, StyleSheet } from "react-native";

import { IntervalImage } from "../enum/IntervalImage";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";

export function ImageButton({
  intervalImage,
  onPress,
  style,
}: {
  intervalImage: IntervalImage;
  onPress: Function;
  style?: ViewStyle | ViewStyle[];
}) {
  function onPressHandler() {
    onPress();
  }

  // https://www.cssfontstack.com/oldsites/hexcolortool/
  function getPrimaryColor(): string {
    return Colors.primary;
  }

  function getPrimaryGradientColor(): string {
    return Colors.gradientPrimary;
  }

  function getStart() {
    return { x: 0, y: 0 };
  }

  function getEnd() {
    return { x: 1, y: 1 };
  }

  return (
    <View style={style}>
      <Pressable onPress={onPressHandler}>
        {({ pressed }) => (
          <LinearGradient
            colors={[getPrimaryColor(), getPrimaryGradientColor()]}
            start={getStart()}
            end={getEnd()}
            style={styles.gradient}
          >
            <View style={[styles.image, pressed && styles.imageOpacity]}>
              {intervalImage}
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Spacing.button.borderRadius,
  },
  image: {
    backgroundColor: Colors.backgroundImageButton,
    borderRadius: Spacing.button.borderRadius,
    margin: 3,
    padding: 10,
  },
  imageOpacity: {
    opacity: 0.7,
  },
});
