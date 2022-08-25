import { useEffect, useState, useRef } from "react";
import { Button, StyleSheet, View, Text } from "react-native";

import { RootStackScreenProps } from "../types";

export default function TimerScreen({
  navigation,
}: RootStackScreenProps<"CreateTimer">) {
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

  const [timerId, setTimerId] = useState<NodeJS.Timer>();
  const [timeHasRunInMillis, setTimeHasRunInMillis] = useState<number>(0);
  const [currentInterval, setCurrentInterval] = useState<Interval>();
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [durationLeftInInterval, setDurationLeftInInterval] = useState(0);
  const [timerBarHeight, setTimerBarHeight] = useState(100);
  const [timeLeft, setTimeLeft] = useState(5000);
  const totalTime = 5000;
  const intervalDurationInMillis = 50;

  const [seconds, setSeconds] = useState(0);
  const [currentIntervalSuration, setCurrentIntervalDuration] = useState(10000);
  const [currentDurationLeft, setCurrentDurationLeft] = useState(
    currentIntervalSuration
  );
  const durationLeftRef = useRef(currentDurationLeft);

  useEffect(() => {
    // console.log("useEffect");
    // setCurrentIntervalHandler();
    countDown();

    return () => {
      cancelTimer();
    };
  }, []);

  function countDown(): void {
    setTimerId(
      setInterval(() => {
        durationLeftRef.current -= intervalDurationInMillis;
        if (durationLeftRef.current < 0) {
          handleCurrentInterval();
        } else {
          setCurrentDurationLeft(durationLeftRef.current);
          handleTimerBar();
        }
      }, intervalDurationInMillis)
    );
  }

  function handleTimerBar(): void {
    const timerBarPercentage =
      (durationLeftRef.current / currentIntervalSuration) * 100;
    setTimerBarHeight(timerBarPercentage);
  }

  function handleCurrentInterval(): void {
    cancelTimer();
  }

  // function setCurrentIntervalHandler(): void {
  //   const currentIndex = currentInterval ? currentIntervalIndex + 1 : 0;
  //   console.log("currentIndex:", currentIndex);
  //   setCurrentIntervalIndex(currentIndex);
  //   console.log("currentIndex1:", currentIndex);
  //   console.log("currentIntervalIndex:", currentIntervalIndex);
  //   console.log(
  //     "intervals[currentIntervalIndex]:",
  //     intervals[currentIntervalIndex]
  //   );
  //   const intervalObj = intervals[currentIntervalIndex];
  //   setCurrentInterval({
  //     color: intervalObj.color,
  //     name: intervalObj.name,
  //     durationLeftInMillis: intervalObj.durationLeftInMillis,
  //     totalDuration: intervalObj.totalDuration,
  //   });
  //   console.log("currentInterval 1:", currentInterval);
  //   console.log("currentInterval 2:", currentInterval);
  // }

  // function countDown(): void {
  //   // console.log("timerun1: ", timeHasRunInMillis);

  //   cancelTimer();

  //   const intervalDurationInMillis = 1000;

  //   setIntervalTimer(
  //     setInterval(() => {
  //       setTimeHasRunInMillis((timeRun) => timeRun + intervalDurationInMillis);

  //       const currentInterval = intervals[currentIntervalIndex];
  //       const currentIntervalDurationLeft = getDurationLeftInInterval();
  //       const currentIntervalDuration = currentInterval.totalDuration;
  //       const timerBarPercentage =
  //         (currentIntervalDurationLeft / currentIntervalDuration) * 100;
  //       setTimerBarHeight(timerBarPercentage);

  //       if (currentInterval !== undefined) {
  //         const interval = currentInterval;
  //         interval.durationLeftInMillis =
  //           currentInterval.durationLeftInMillis - intervalDurationInMillis;
  //         setCurrentInterval(interval);
  //       }

  //       performChecksToAddSound();

  //       if (shouldChangeInterval()) {
  //         setCurrentIntervalHandler();
  //         countDown();

  //         if (isTimerDone()) {
  //           // TODO: Post the workout is completed.

  //           cancelTimer();
  //         }
  //       }
  //     }, intervalDurationInMillis)
  //   );

  //   cancelTimer();
  // }

  function getDurationLeftInInterval(): number {
    //   if (intervals == undefined) {
    //     return 0;
    //   }

    //   const currentIndex = currentIntervalIndex ? currentIntervalIndex : 0;
    //   const currentInterval = intervals[currentIndex];
    //   const currentIntervalDurationLeft = currentInterval
    //     ? currentInterval.durationLeftInMillis
    //     : 0;
    //   return currentIntervalDurationLeft;

    return durationLeftRef.current;
  }

  function shouldChangeInterval(): boolean {
    console.log("currentInterval: ", currentInterval);
    return currentInterval ? currentInterval.durationLeftInMillis < 0 : true;
  }

  function isTimerDone(): boolean {
    // TODO: Need to make sure this is correct.
    return currentIntervalIndex == intervals.length;
  }

  function performChecksToAddSound(): void {}

  function pauseWorkout(): void {
    cancelTimer();
  }

  function cancelTimer(): void {
    clearInterval(timerId);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.timerBar, { height: timerBarHeight + "%" }]}></View>
      <Text style={styles.currentInterval}>
        {/* {intervals[currentIntervalIndex].name} */}
      </Text>
      <Text style={styles.currentIntervalTimeRemaining}>
        {getDurationLeftInInterval()}
      </Text>
      <Text style={styles.intervalsRemaining}>
        {currentIntervalIndex + 1}/{intervals.length}
      </Text>
      <Button
        title="Pause/Play" /*onPress={() => navigation.navigate("Timer")}*/
      />
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
  },
  currentIntervalTimeRemaining: {
    marginTop: 50,
    marginBottom: 50,
    fontSize: 100,
  },
  intervalsRemaining: {
    fontSize: 50,
  },
  stats: {
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 1,
    width: "80%",
  },
});
