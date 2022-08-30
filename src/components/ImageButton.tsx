import { View, ViewStyle, Pressable, StyleSheet } from "react-native";

import { IntervalImage } from "../enum/IntervalImage";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import { IntervalImageGradient } from "../enum/IntervalImageGradient";

export function ImageButton({
  intervalImage,
  colors,
  onPress,
  style,
}: {
  intervalImage: IntervalImage;
  colors: string[];
  onPress: Function;
  style?: ViewStyle | ViewStyle[];
}) {
  function onPressHandler() {
    onPress();
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
              colors={colors}
              start={IntervalImageGradient.start}
              end={IntervalImageGradient.end}
              style={styles.gradient}
            >
              <View style={styles.image}>{intervalImage}</View>
            </LinearGradient>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  unpressedBackground: {
    opacity: 1,
    backgroundColor: Colors.background.button.image.pressedFullOpacity,
    borderRadius: Spacing.button.borderRadius,
  },
  pressedBackground: {
    opacity: 0.8,
  },
  gradient: {
    borderRadius: Spacing.button.borderRadius,
  },
  image: {
    backgroundColor: Colors.background.button.image.unpressed,
    borderRadius: Spacing.button.borderRadius,
    margin: 3,
    padding: 10,
  },
});
