import { View, Text, StyleSheet, TextInput, ViewStyle } from "react-native";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";

export function Input({
  title,
  prefix,
  style,
}: {
  title: string;
  prefix?: string;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.inputContainer}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderColor: Colors.border,
    borderWidth: Spacing.input.border.width,
    borderRadius: Spacing.input.border.radius,
  },
  title: {
    position: "absolute",
    marginTop: -12,
    marginLeft: 5,
    paddingHorizontal: 5,
    backgroundColor: Colors.inputTitleBackground,
  },
  inputContainer: {
    flexDirection: "row",
  },
  prefix: {
    marginTop: 4,
    padding: Spacing.input.padding,
    color: Colors.textPrefix,
  },
  input: {
    padding: Spacing.input.padding,
    color: Colors.text,
  },
});
