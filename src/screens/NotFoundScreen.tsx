import { StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export default function NotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <TouchableOpacity
        onPress={() => navigation.replace("Root")}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to home screen!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: Spacing.touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    color: "#2e78b7",
    textAlign: "center",
  },
});
