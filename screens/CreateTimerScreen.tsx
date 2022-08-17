import { useState } from "react";
import { Button, ScrollView, StyleSheet, TextInput } from "react-native";
import IntervalInput from "../components/IntervalInput";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";

export default function SelectTimerScreen({ navigation }: RootStackScreenProps<'CreateTimer'>) {
  const [highIntervalName, setHighIntervalNameText] = useState("High Interval");
  const [lowIntervalName, setLowIntervalNameText] = useState("Low Interval");
  const [highInterval, setHighIntervalText] = useState("00m 00s");

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
        <IntervalInput defaultText="High Interval" />
        <IntervalInput defaultText="Low Interval" />
      </ScrollView>
      <View style={styles.stats}>
        <View style={styles.separator}></View>
        <Button title="Start" onPress={() => navigation.navigate('Timer')} />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 25,
  },
  stats: {
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 1,
    width: "80%",
  },
});
