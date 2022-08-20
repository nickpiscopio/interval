import { View, StyleSheet } from "react-native";

export function Spacer() {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
