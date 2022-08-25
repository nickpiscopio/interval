import { useEffect, useState, useRef } from "react";
import { Button, StyleSheet, View, Text } from "react-native";

import Colors from "../constants/Colors";
import { RootStackScreenProps } from "../types";

export default function TimerScreen({ route }: RootStackScreenProps<"Timer">) {
  const [timeHasRunInMillis, setTimeHasRunInMillis] = useState<number>(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(-1);
  const [currentInterval, setCurrentInterval] = useState<Interval>();
  const [timerBarHeight, setTimerBarHeight] = useState(100);
  const currentIntervalIndexRef = useRef(currentIntervalIndex);
  const timerIdRef = useRef<NodeJS.Timer>();
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    setCurrentIntervalHandler();
    countDown();

    return () => {
      cancelTimer();
    };
  }, []);

  function handleTimerBar(): void {
    const currentInterval = getCurrentInterval();
    if (currentInterval == undefined) {
      return setTimerBarHeight(100);
    }

    const timerBarPercentage =
      (currentInterval.durationLeftInMillis / currentInterval.totalDuration) *
      100;
    setTimerBarHeight(timerBarPercentage);
  }

  function setCurrentIntervalHandler(): void {
    currentIntervalIndexRef.current += 1;
  }

  function countDown(): void {
    cancelTimer();

    const intervalDurationInMillis = 50;

    timerIdRef.current = setInterval(() => {
      setTimeHasRunInMillis((timeRun) => timeRun + intervalDurationInMillis);

      const currentInterval = getCurrentInterval();
      handleTimerBar();

      if (currentInterval !== undefined) {
        const interval = currentInterval;
        interval.durationLeftInMillis =
          currentInterval.durationLeftInMillis - intervalDurationInMillis;
        setCurrentInterval(interval);
      }

      performChecksToAddSound();

      if (shouldChangeInterval()) {
        setCurrentIntervalHandler();
        countDown();

        if (isTimerDone()) {
          // TODO: Post the workout is completed.

          cancelTimer();
        }
      }
    }, intervalDurationInMillis);
  }

  function getDurationLeftInInterval(): number {
    const currentInterval = getCurrentInterval();
    if (getIntervals() == undefined || currentInterval == undefined) {
      return 0;
    }

    return Math.ceil(currentInterval.durationLeftInMillis / 1000);
  }

  function getCurrentIntervalBackgroundColor(): string {
    const currentInterval = getCurrentInterval();
    return currentInterval ? currentInterval.color : "";
  }

  function getCurrentIntervalName(): string {
    const currentInterval = getCurrentInterval();
    return currentInterval ? currentInterval.name : "";
  }

  function getCurrentInterval(): Interval | undefined {
    return getIntervals()[getCurrentIntervalIndex()];
  }

  function getCurrentIntervalIndex(): number {
    return currentIntervalIndexRef.current;
  }

  function shouldChangeInterval(): boolean {
    const currentInterval = getCurrentInterval();
    return currentInterval ? currentInterval.durationLeftInMillis < 0 : true;
  }

  function isTimerDone(): boolean {
    // TODO: Need to make sure this is correct.
    return currentIntervalIndexRef.current == getIntervals().length;
  }

  function performChecksToAddSound(): void {}

  function pauseWorkout(): void {
    isPausedRef.current = !isPausedRef.current;

    if (isPausedRef.current) {
      cancelTimer();

      return;
    }

    countDown();
  }

  function cancelTimer(): void {
    clearInterval(timerIdRef.current);
    timerIdRef.current == undefined;
  }

  function getIntervals(): Interval[] {
    return route.params.intervals;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getCurrentIntervalBackgroundColor() },
      ]}
    >
      <View style={[styles.timerBar, { height: timerBarHeight + "%" }]}></View>
      <Text style={styles.currentInterval}>{getCurrentIntervalName()}</Text>
      <Text style={styles.currentIntervalTimeRemaining}>
        {getDurationLeftInInterval()}
      </Text>
      <Text style={styles.intervalsRemaining}>
        {getCurrentIntervalIndex() + 1}/{getIntervals().length}
      </Text>
      <Button title="Pause/Play" onPress={() => pauseWorkout()} />
    </View>
  );
}

// function intervalHandler(text: string): void {
//     setHighIntervalNameText(text);
//   }

//   function highIntervalInputHandler(interval: string): void {
//     setHighIntervalText(interval);
//   }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBar: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  currentInterval: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.timerText,
  },
  currentIntervalTimeRemaining: {
    marginTop: 50,
    marginBottom: 50,
    fontSize: 100,
    color: Colors.timerText,
  },
  intervalsRemaining: {
    fontSize: 50,
    color: Colors.timerText,
  },
  stats: {
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 1,
    width: "80%",
  },
});
