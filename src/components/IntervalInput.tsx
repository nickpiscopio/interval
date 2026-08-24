import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

import { View } from "./Themed";

import Spacing from "../constants/Spacing";

export function IntervalInput({
  defaultText,
}: {
  defaultText: string;
}) {
  const [highIntervalName, setHighIntervalNameText] = useState(defaultText);
  const [highInterval, setHighIntervalText] = useState("00m 00s");

  function highIntervalNameInputHandler(text: string): void {
    setHighIntervalNameText(text);
  }

  function highIntervalInputHandler(interval: string): void {
    setHighIntervalText(interval);
  }

  return (
    <View
      style={[styles.card, styles.shadowProp, styles.elevation, styles.row]}
    >
      <TextInput
        style={[styles.interval, styles.input]}
        onChangeText={highIntervalNameInputHandler}
        value={highIntervalName}
      />
      <TextInput
        style={styles.input}
        onChangeText={highIntervalInputHandler}
        value={highInterval}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  interval: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Spacing.touchTarget.min,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 3,
    shadowColor: "#52006A",
  },
  separator: {
    marginVertical: Spacing.xl,
    height: 1,
    width: "80%",
  },
});
