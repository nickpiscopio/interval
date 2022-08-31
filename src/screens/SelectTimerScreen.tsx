import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>No timers created</Text>
        <PrimaryButton
          title="+ Create Timer"
          onPress={() => navigation.navigate("CreateTimer")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    marginBottom: 20,
  },
});
