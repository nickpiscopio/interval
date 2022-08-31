import { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, StatusBar, Alert } from "react-native";

import Colors from "../constants/Colors";
import { Spacer } from "../components/Spacer";
import { ImageButton } from "../components/ImageButton";
import { IntervalImage } from "../enum/IntervalImage";
import { IntervalImageGradient } from "../enum/IntervalImageGradient";
import { RootStackScreenProps } from "../types";
import Spacing from "../constants/Spacing";
import Sounds from "../constants/Sounds";
// import Sound from "react-native-sound";

export default function TimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"Timer">) {
  const [timeHasRunInMillis, setTimeHasRunInMillis] = useState<number>(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(-1);
  const [currentInterval, setCurrentInterval] = useState<Interval>();
  const [timerBarHeight, setTimerBarHeight] = useState(100);
  const currentIntervalIndexRef = useRef(currentIntervalIndex);
  const timerIdRef = useRef<NodeJS.Timer>();
  const isPausedRef = useRef<boolean>(false);
  const playPauseImageButtonRef = useRef<IntervalImage>(IntervalImage.pause);

  // const beep1 = new Sound(Sounds.beep1);
  // const beep2 = new Sound(Sounds.beep2);

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

    playPauseImageButtonRef.current = IntervalImage.pause;

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

      performChecksToPlaySound();

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

  function performChecksToPlaySound(): void {
    switch (getCurrentInterval()?.durationLeftInMillis) {
      case 3000:
      case 2000:
      case 1000:
        // beep1.play();
        break;
      case 0:
        // beep2.play();
        break;
      default:
        break;
    }
  }

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

    playPauseImageButtonRef.current = IntervalImage.play;
  }

  function getIntervals(): Interval[] {
    return route.params.intervals;
  }

  function askToCloseWorkout(): void {
    Alert.alert(
      "Cancel Timer?",
      "Are you sure you want to cancel this timer? This will go back to the previous screen.",
      [
        { text: "Stay Here", onPress: () => {}, style: "cancel" },
        {
          text: "Cancel Timer",
          onPress: () => {
            goBack();
          },
          style: "destructive",
        },
      ]
    );
  }

  function goBack(): void {
    navigation.goBack();
  }

  function shouldDisplayCloseButton(): boolean {
    return isPausedRef.current;
  }

  function getPlayPauseButton(): IntervalImage {
    return playPauseImageButtonRef.current;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getCurrentIntervalBackgroundColor() },
      ]}
    >
      <View style={[styles.timerBar, { height: timerBarHeight + "%" }]}></View>

      <View style={styles.containerHeader}>
        <Spacer />
        <ImageButton
          intervalImage={IntervalImage.close}
          backgroundColor={getCurrentIntervalBackgroundColor()}
          onPress={() => askToCloseWorkout()}
          style={{ display: shouldDisplayCloseButton() ? "flex" : "flex" }}
        />
      </View>

      <View style={styles.containerTimer}>
        <Text style={styles.currentInterval}>{getCurrentIntervalName()}</Text>
        <Text style={styles.currentIntervalTimeRemaining}>
          {getDurationLeftInInterval()}
        </Text>
        <Text style={styles.intervalsRemaining}>
          {getCurrentIntervalIndex() + 1}/{getIntervals().length}
        </Text>
      </View>
      <View style={styles.containerPlayPause}>
        <ImageButton
          intervalImage={getPlayPauseButton()}
          gradientColors={IntervalImageGradient.colors.solid.asStrings}
          backgroundColor={getCurrentIntervalBackgroundColor()}
          onPress={() => pauseWorkout()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerHeader: {
    marginTop: StatusBar.currentHeight,
    marginHorizontal: Spacing.window.padding,
    flexDirection: "row",
  },
  containerTimer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  containerPlayPause: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.window.padding,
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
