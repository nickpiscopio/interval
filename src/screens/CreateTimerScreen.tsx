import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { IntervalInput } from "../components/IntervalInput";
import { Input } from "../components/Input";

import { View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import { PrimaryButton } from "../components/PrimaryButton";
import { Spacer } from "../components/Spacer";
import { ImageButton } from "../components/ImageButton";
import { IntervalImage } from "../enum/IntervalImage";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"CreateTimer">) {
  const [highIntervalName, setHighIntervalNameText] = useState("High Interval");
  const [lowIntervalName, setLowIntervalNameText] = useState("Low Interval");
  const [highInterval, setHighIntervalText] = useState("00m 00s");

  const [intervals, setIntervals] = useState<Interval[]>([
    {
      color: "#1ACC6C",
      name: "High Interval",
      durationLeftInMillis: 3000,
      totalDuration: 3000,
    },
    {
      color: "#1A6CCC",
      name: "Low Interval",
      durationLeftInMillis: 4000,
      totalDuration: 4000,
    },
    {
      color: "#1ACC6C",
      name: "High Interval",
      durationLeftInMillis: 3000,
      totalDuration: 3000,
    },
    {
      color: "#1A6CCC",
      name: "Low Interval",
      durationLeftInMillis: 4000,
      totalDuration: 4000,
    },
    {
      color: "#1ACC6C",
      name: "High Interval",
      durationLeftInMillis: 3000,
      totalDuration: 3000,
    },
    {
      color: "#1A6CCC",
      name: "Low Interval",
      durationLeftInMillis: 4000,
      totalDuration: 4000,
    },
  ]);

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
        <View style={styles.inputs}>
          <Input title="Name" style={styles.nameInput} />
          <Input
            title="Rounds"
            prefix="x"
            style={styles.roundsInput}
            leftAlignText={false}
          />
        </View>
        <View style={styles.separator}></View>
        <View style={styles.statsButtons}>
          <ImageButton intervalImage={IntervalImage.delete} onPress={() => {}} />
          <Spacer />
          <ImageButton intervalImage={IntervalImage.save} onPress={() => {}} />
          <PrimaryButton
            title="Start"
            onPress={() => navigation.navigate("Timer", { intervals: intervals })}
            styles={styles.startButton}
          />
        </View>
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
    padding: Spacing.window.padding,
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 1,
    marginVertical: Spacing.window.padding,
    backgroundColor: Colors.shadow,
  },
  inputs: {
    flexDirection: "row",
  },
  nameInput: {
    flex: 2.5,
    marginRight: Spacing.input.margin,
  },
  roundsInput: {
    flex: 1,
  },
  statsButtons: {
    flexDirection: "row",
  },
  startButton: {
    marginLeft: Spacing.window.small,
  },
});
