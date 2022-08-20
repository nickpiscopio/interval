import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

import { View } from "./Themed";

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
    
  },
  interval: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
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
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
