import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ViewStyle,
  Pressable,
} from "react-native";
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";
import Spacing from "../constants/Spacing";

export function Input({
  title,
  prefix,
  style,
  leftAlignText = true,
}: {
  title: string;
  prefix?: string;
  style?: ViewStyle | ViewStyle[];
  leftAlignText?: boolean;
}) {
  const textInputRef = useRef<TextInput>(null);

  function focusTextInput() {
    textInputRef.current?.focus();
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={focusTextInput}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.inputContainer}>
          {prefix && <Text style={styles.prefix}>{prefix}</Text>}
          <TextInput
            style={[
              styles.input,
              { textAlign: leftAlignText ? "left" : "right" },
            ]}
            ref={textInputRef}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    borderColor: Colors.border,
    borderWidth: Spacing.input.border.width,
    borderRadius: Spacing.input.border.radius,
  },
  title: {
    position: "absolute",
    marginTop: -10,
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    color: Colors.inputTitle,
    backgroundColor: Colors.inputTitleBackground,
    fontSize: FontSize.input.title,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Spacing.input.minHeight,
  },
  prefix: {
    paddingVertical: Spacing.input.padding,
    paddingLeft: Spacing.input.padding,
    color: Colors.textPrefix,
    fontSize: FontSize.input.prefix,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.input.padding,
    paddingHorizontal: Spacing.input.padding,
    color: Colors.text,
    fontSize: FontSize.input.text,
  },
});
