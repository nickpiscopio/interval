import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

import { RootStackScreenProps } from "../types";
import { Interval } from "../model/Interval";
import { t } from "../i18n";
import { useAlert } from "../context/AlertContext";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import { resolveSoundId, resolveSoundSource } from "../constants/Sounds";
import FontSize from "../constants/FontSize";
import IntervalTimeline from "../components/IntervalTimeline";

const KEEP_AWAKE_TAG = "timer-running";

export default function TimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"Timer">) {
  const { showAlert } = useAlert();
  const { timer } = route.params;

  // Sound Ref
  const activePlayerRef = useRef<AudioPlayer | null>(null);

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

  function activateScreenLock(): void {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
  }

  function deactivateScreenLock(): void {
    deactivateKeepAwake(KEEP_AWAKE_TAG);
  }

  function stopAndReleaseSound(): void {
    if (activePlayerRef.current) {
      try {
        activePlayerRef.current.pause();
      } catch {}
      try {
        activePlayerRef.current.release();
      } catch {}
      activePlayerRef.current = null;
    }
  }

  function playIntervalSound(interval?: Interval): void {
    const soundId = resolveSoundId(interval?.sound);
    const source = resolveSoundSource(soundId);
    stopAndReleaseSound();
    if (!source) return;

    try {
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      }).catch(() => {});
      const player = createAudioPlayer(source);
      activePlayerRef.current = player;
      player.play();
    } catch (e) {
      console.warn("Failed to play interval sound:", e);
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

  function jumpToInterval(targetIndex: number): void {
    const intervalsList = flatIntervalsRef.current;
    if (targetIndex < 0 || targetIndex >= intervalsList.length) return;

    const targetInterval = intervalsList[targetIndex];
    const targetDurationMs = (targetInterval.duration || 0) * 1000;

    currentIndexRef.current = targetIndex;
    durationLeftRef.current = targetDurationMs;
    totalDurationRef.current = targetDurationMs;

    setCurrentIntervalIndex(targetIndex);
    setDurationLeft(targetInterval.duration || 0);
    setTotalDuration(targetDurationMs);

    progressAnim.stopAnimation();
    progressAnim.setValue(1);
    stopAndReleaseSound();

    if (!isPausedRef.current) {
      startProgressAnim(targetDurationMs, 1);
      playIntervalSound(targetInterval);
    }
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

    isPausedRef.current = false;
    if (list.length > 0) {
      jumpToInterval(0);
    }

    activateScreenLock();
    startCountDown();

    return () => {
      clearInterval(timerIdRef.current);
      progressAnim.stopAnimation();
      stopAndReleaseSound();
      deactivateScreenLock();
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
          stopAndReleaseSound();
          deactivateScreenLock();
          navigation.replace("Completion", { timer });
        } else {
          jumpToInterval(nextIdx);
        }
      }
    }, tickMs);
  }

  // Calculate current round
  const currentRound = currentInterval
    ? Math.floor(currentIntervalIndex / timer.intervals.length) + 1
    : 1;

  function togglePlayPause() {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
    if (nextPaused) {
      progressAnim.stopAnimation();
      deactivateScreenLock();
      stopAndReleaseSound();
    } else {
      activateScreenLock();
      playIntervalSound(flatIntervalsRef.current[currentIndexRef.current]);
      const fraction = totalDurationRef.current > 0 ? durationLeftRef.current / totalDurationRef.current : 1;
      startProgressAnim(durationLeftRef.current, fraction);
    }
  }

  function askToCloseWorkout() {
    const wasPaused = isPausedRef.current;
    isPausedRef.current = true;
    setIsPaused(true);
    progressAnim.stopAnimation();
    deactivateScreenLock();
    stopAndReleaseSound();

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
              activateScreenLock();
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
            stopAndReleaseSound();
            deactivateScreenLock();
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
    <View
      testID="timer-screen-container"
      style={[styles.container, { backgroundColor: currentInterval.color }]}
    >
      <StatusBar style="light" />

      {/* Upper Hero Region — 60fps liquid-drain progress bar stays confined here */}
      <View style={styles.upperRegion}>
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
            <Ionicons name="close" size={24} color={Colors.textScale.inverse} />
          </TouchableOpacity>
        </View>

        {/* Timer Details Panel - Hero Centered */}
        <View style={styles.detailsContainer}>
          <Text testID="hero-interval-name" style={styles.intervalName}>
            {currentInterval.name}
          </Text>
          <Text testID="hero-countdown" style={styles.countdown}>
            {`${durationLeft}s`}
          </Text>
        </View>

        {/* Compact Bottom Control Bar */}
        <View style={styles.controlsBar}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              {t("timer.roundOf", { current: currentRound, total: timer.rounds })}
            </Text>
            <Text style={styles.metaSubtext}>
              {`Interval ${currentIntervalIndex + 1}/${flatIntervals.length}`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={28}
              color={currentInterval.color}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Docked Scrollable Interval Timeline */}
      <IntervalTimeline
        intervals={flatIntervals}
        currentIntervalIndex={currentIntervalIndex}
        activeColor={currentInterval.color}
        onSelectInterval={jumpToInterval}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperRegion: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 50,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface.screen,
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
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
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
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
    textAlign: "center",
  },
  countdown: {
    fontSize: 96,
    lineHeight: 104,
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  metaContainer: {
    flex: 1,
    marginRight: Spacing.md,
    opacity: 0.9,
  },
  metaText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
  },
  metaSubtext: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: FontSize.fontFamily.medium,
    color: Colors.textScale.inverse,
    opacity: 0.85,
    marginTop: Spacing.xs / 2,
  },
  controlBtn: {
    width: Spacing.touchTarget.cta,
    minHeight: Spacing.touchTarget.cta,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Spacing.shadows.floating,
  },
});
