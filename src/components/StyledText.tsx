import { Text, TextStyle } from "react-native";

export function StyledText({
  style,
  text,
}: {
  style: TextStyle;
  text: string;
}) {
  return <Text style={[style, { fontFamily: "open-sans" }]}>{text}</Text>;
}
