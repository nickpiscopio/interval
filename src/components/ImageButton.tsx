import { View, StyleSheet, ViewStyle, Pressable, Image } from "react-native";
import { ImageSrc } from "../enum/ImageSrc";
import { SvgUri } from 'react-native-svg';
// import TestSvg from "../../assets/images/save.svg";          // SVG File

export function ImageButton({
  imageButtonSrc,
  onPress,
  style,
}: {
  imageButtonSrc: ImageSrc;
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
          <Image
            source={imageButtonSrc}
            style={[styles.image, pressed && styles.imageOpacity]}


          />

          // <testSvg />

          // <SvgUri
          // width="100%"
          // height="100%"
          // uri={testSvg}
      // />
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
