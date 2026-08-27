import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import { RootStackScreenProps } from "../types";
import { Interval } from "../model/Interval";
import { t } from "../i18n";
import { useAlert } from "../context/AlertContext";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export default function TimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"Timer">) {
  const { showAlert } = useAlert();
  const { timer } = route.params;

  // Sound Ref
  const beepSoundRef = useRef<Audio.Sound | null>(null);

  // Animated background progress (1 -> 0 over interval duration in ms)
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Flat list of intervals across all rounds
  const [flatIntervals, setFlatIntervals] = useState<Interval[]>([]);
  const flatIntervalsRef = useRef<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [durationLeft, setDurationLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const totalDurationRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for timer loops
  const timerIdRef = useRef<any>(undefined);
  const currentIndexRef = useRef(0);
  const durationLeftRef = useRef(0);
  const isPausedRef = useRef(false);

  const currentInterval = flatIntervals[currentIntervalIndex];

  async function loadSounds(): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/beep.mp3")
      );
      beepSoundRef.current = sound;
    } catch (e) {
      console.warn("Failed to load audio beep:", e);
    }
  }

  async function unloadSounds(): Promise<void> {
    if (beepSoundRef.current) {
      await beepSoundRef.current.unloadAsync().catch(() => {});
      beepSoundRef.current = null;
    }
  }

  function playBeep(): void {
    if (beepSoundRef.current) {
      beepSoundRef.current.replayAsync().catch(() => {});
    }
  }

  function startProgressAnim(durationMs: number, fromFraction = 1) {
    progressAnim.stopAnimation();
    progressAnim.setValue(fromFraction);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }

  // Initialize flat list of intervals
  useEffect(() => {
    const list: Interval[] = [];
    for (let r = 0; r < timer.rounds; r++) {
      timer.intervals.forEach((int) => {
        list.push({
          ...int,
          // Store raw duration in milliseconds for runner
          durationLeftInMillis: int.duration * 1000,
          totalDuration: int.duration * 1000
        });
      });
    }
    flatIntervalsRef.current = list;
    setFlatIntervals(list);
    
    if (list.length > 0) {
      setCurrentIntervalIndex(0);
      currentIndexRef.current = 0;
      setDurationLeft(list[0].duration);
      durationLeftRef.current = list[0].duration * 1000;
      totalDurationRef.current = list[0].duration * 1000;
      setTotalDuration(list[0].duration * 1000);
      startProgressAnim(list[0].duration * 1000, 1);
    }

    loadSounds().then(() => {
      playBeep();
    });
    isPausedRef.current = false;
    startCountDown();

    return () => {
      clearInterval(timerIdRef.current);
      progressAnim.stopAnimation();
      unloadSounds();
    };
  }, [timer]);

  function startCountDown(): void {
    clearInterval(timerIdRef.current);
    const tickMs = 100; // tick every 100ms for accurate countdown calculations

    timerIdRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      durationLeftRef.current -= tickMs;
      const secLeft = Math.ceil(durationLeftRef.current / 1000);
      setDurationLeft((prevSec) => (prevSec !== secLeft ? Math.max(0, secLeft) : prevSec));

      if (durationLeftRef.current <= 0) {
        // Move to next interval
        const nextIdx = currentIndexRef.current + 1;
        const intervalsList = flatIntervalsRef.current;
        if (nextIdx >= intervalsList.length) {
          // Workout finished!
          clearInterval(timerIdRef.current);
          progressAnim.stopAnimation();
          navigation.replace("Completion", { timer });
        } else {
          currentIndexRef.current = nextIdx;
          setCurrentIntervalIndex(nextIdx);
          const nextInt = intervalsList[nextIdx];
          const nextDurationMs = (nextInt.duration || 0) * 1000;
          durationLeftRef.current = nextDurationMs;
          totalDurationRef.current = nextDurationMs;
          setDurationLeft(nextInt.duration || 0);
          setTotalDuration(nextDurationMs);
          startProgressAnim(nextDurationMs, 1);
          playBeep();
        }
      }
    }, tickMs);
  }

  // Calculate current round
  const currentRound = currentInterval
    ? Math.floor(currentIntervalIndex / timer.intervals.length) + 1
    : 1;

  // Next up info
  let nextInterval: Interval | undefined;
  if (currentIntervalIndex + 1 < flatIntervals.length) {
    nextInterval = flatIntervals[currentIntervalIndex + 1];
  }

  function togglePlayPause() {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
    if (nextPaused) {
      progressAnim.stopAnimation();
    } else {
      playBeep();
      const fraction = totalDurationRef.current > 0 ? durationLeftRef.current / totalDurationRef.current : 1;
      startProgressAnim(durationLeftRef.current, fraction);
    }
  }

  function askToCloseWorkout() {
    const wasPaused = isPausedRef.current;
    isPausedRef.current = true;
    setIsPaused(true);
    progressAnim.stopAnimation();

    showAlert({
      title: t("timer.exitTitle"),
      message: t("timer.exitMessage"),
      icon: "warning",
      buttons: [
        {
          text: t("timer.exitCancel"),
          style: "cancel",
          onPress: () => {
            setIsPaused(wasPaused);
            isPausedRef.current = wasPaused;
            if (!wasPaused) {
              const fraction = totalDurationRef.current > 0 ? durationLeftRef.current / totalDurationRef.current : 1;
              startProgressAnim(durationLeftRef.current, fraction);
            }
          },
        },
        {
          text: t("timer.exitConfirm"),
          style: "destructive",
          onPress: () => {
            clearInterval(timerIdRef.current);
            progressAnim.stopAnimation();
            navigation.popToTop();
          },
        },
      ],
    });
  }

  if (!currentInterval) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Text>{t("timer.preparing")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentInterval.color }]}>
      <StatusBar style="light" />

      {/* Fluid continuous 60fps progress background bar */}
      <Animated.View
        style={[
          styles.timerBar,
          {
            height: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />

      {/* Header Panel */}
      <View style={styles.header}>
        <Text style={styles.workoutName}>{timer.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={askToCloseWorkout}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Timer Details Panel - Hero Centered */}
      <View style={styles.detailsContainer}>
        <Text style={styles.intervalName}>{currentInterval.name}</Text>
        <Text style={styles.countdown}>{durationLeft}s</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{t("timer.roundOf", { current: currentRound, total: timer.rounds })}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>
            Interval {currentIntervalIndex + 1}/{flatIntervals.length}
          </Text>
        </View>

        {nextInterval && (
          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpLabel}>{t("timer.nextUp")}</Text>
            <Text style={styles.nextUpValue}>
              {nextInterval.name} ({nextInterval.duration}s)
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlBtn} onPress={togglePlayPause} activeOpacity={0.8}>
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={28}
            color={currentInterval.color}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  timerBar: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    minHeight: Spacing.touchTarget.min,
    zIndex: 10,
  },
  workoutName: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    opacity: 0.9,
    flex: 1,
  },
  closeButton: {
    width: Spacing.touchTarget.min,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.touchTarget.min / 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  intervalName: {
    fontSize: FontSize["2xl"],
    lineHeight: FontSize.lineHeight["2xl"],
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  countdown: {
    fontSize: 96,
    lineHeight: 104,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    marginVertical: Spacing.md,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    opacity: 0.9,
  },
  metaText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: "#FFFFFF",
  },
  metaDivider: {
    fontSize: FontSize.sm,
    color: "#FFFFFF",
  },
  nextUpCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Spacing.radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  nextUpLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    opacity: 0.7,
    letterSpacing: 1,
  },
  nextUpValue: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    marginTop: Spacing.xs / 2,
    textAlign: "center",
  },
  controlsContainer: {
    minHeight: 112,
    paddingVertical: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  controlBtn: {
    width: 64,
    minHeight: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
});
