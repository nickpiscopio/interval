import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { IntervalImage } from "../enum/IntervalImage";

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

  return (
    <View style={style}>
      <Pressable onPress={onPressHandler}>
        {({ pressed }) => (
          <View style={pressed && styles.imageOpacity}>
            {intervalImage}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    // flex: 1,
    resizeMode: "contain"
  },
  imageOpacity: {
    opacity: 0.7,
  },
});
