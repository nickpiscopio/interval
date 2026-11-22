import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootStackScreenProps } from "../types";
import { Interval } from "../model/Interval";
import { t } from "../i18n";
import { useAlert } from "../context/AlertContext";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import { resolveSoundId, resolveSoundSource } from "../constants/Sounds";
import FontSize from "../constants/FontSize";
import IntervalTimeline from "../components/IntervalTimeline";
import { useTimerVoiceControl } from "../hooks/useTimerVoiceControl";

const KEEP_AWAKE_TAG = "timer-running";
const COMPLETION_INTEGRITY_THRESHOLD = 0.85;

export default function TimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"Timer">) {
  const { showAlert } = useAlert();
  const { timer } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

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
  const creditedMsRef = useRef<number[]>([]);
  const stopVoiceControlRef = useRef<() => void>(() => {});

  const currentInterval = flatIntervals[currentIntervalIndex];

  function activateScreenLock(): void {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
  }

  function deactivateScreenLock(): void {
    deactivateKeepAwake(KEEP_AWAKE_TAG);
  }

  function lockPortraitOrientation(): void {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }

  // Unlock orientation while active Timer runner is mounted; re-lock to portrait on unmount
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    return () => {
      lockPortraitOrientation();
    };
  }, []);

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
    creditedMsRef.current = list.map(() => 0);
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

      const idx = currentIndexRef.current;
      const intervalsList = flatIntervalsRef.current;
      const activeInterval = intervalsList[idx];
      if (activeInterval && activeInterval.duration > 0) {
        const maxMs = activeInterval.duration * 1000;
        creditedMsRef.current[idx] = Math.min(
          maxMs,
          (creditedMsRef.current[idx] || 0) + tickMs
        );
      }

      durationLeftRef.current -= tickMs;
      const secLeft = Math.ceil(durationLeftRef.current / 1000);
      setDurationLeft((prevSec) => (prevSec !== secLeft ? Math.max(0, secLeft) : prevSec));

      if (durationLeftRef.current <= 0) {
        // Move to next interval
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx >= intervalsList.length) {
          // Workout finished!
          clearInterval(timerIdRef.current);
          progressAnim.stopAnimation();
          stopAndReleaseSound();
          deactivateScreenLock();
          lockPortraitOrientation();
          stopVoiceControlRef.current();

          const totalTimeSeconds = intervalsList.reduce(
            (sum, int) => sum + (int.duration || 0),
            0
          );
          const totalCreditedMs = creditedMsRef.current.reduce(
            (sum, ms) => sum + ms,
            0
          );
          const performedSeconds = Math.min(
            totalTimeSeconds,
            Math.round(totalCreditedMs / 1000)
          );
          const completedIntervals = intervalsList.filter(
            (int, i) =>
              int.duration > 0 &&
              (creditedMsRef.current[i] || 0) >=
                int.duration * 1000 * COMPLETION_INTEGRITY_THRESHOLD
          ).length;
          const qualifiesForCredit =
            totalTimeSeconds > 0 &&
            totalCreditedMs / (totalTimeSeconds * 1000) >=
              COMPLETION_INTEGRITY_THRESHOLD;

          navigation.replace("Completion", {
            timer,
            performedSeconds,
            completedIntervals,
            qualifiesForCredit,
          });
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

  function pauseTimer() {
    setIsPaused(true);
    isPausedRef.current = true;
    progressAnim.stopAnimation();
    deactivateScreenLock();
    stopAndReleaseSound();
  }

  function resumeTimer(shouldPlaySound: boolean) {
    setIsPaused(false);
    isPausedRef.current = false;
    activateScreenLock();
    if (shouldPlaySound) {
      playIntervalSound(flatIntervalsRef.current[currentIndexRef.current]);
    }
    const fraction =
      totalDurationRef.current > 0
        ? durationLeftRef.current / totalDurationRef.current
        : 1;
    startProgressAnim(durationLeftRef.current, fraction);
  }

  function pauseForModal(): boolean {
    const wasPaused = isPausedRef.current;
    pauseTimer();
    return wasPaused;
  }

  function restoreAfterModal(wasPaused: boolean) {
    if (wasPaused) {
      setIsPaused(true);
      isPausedRef.current = true;
    } else {
      resumeTimer(false);
    }
  }

  const voiceControl = useTimerVoiceControl({
    isPausedRef,
    onVoicePlay: () => resumeTimer(true),
    onVoicePause: pauseTimer,
    pauseForModal,
    restoreAfterModal,
    showAlert,
  });
  stopVoiceControlRef.current = voiceControl.stopVoiceControlForExit;

  function togglePlayPause() {
    if (isPausedRef.current) {
      resumeTimer(true);
    } else {
      pauseTimer();
    }
  }

  function askToCloseWorkout() {
    const wasPaused = pauseForModal();
    voiceControl.pauseRecognitionForAlert();

    showAlert({
      title: t("timer.exitTitle"),
      message: t("timer.exitMessage"),
      icon: "warning",
      buttons: [
        {
          text: t("timer.exitCancel"),
          style: "cancel",
          onPress: () => {
            restoreAfterModal(wasPaused);
            voiceControl.resumeRecognitionAfterAlert();
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
            lockPortraitOrientation();
            voiceControl.stopVoiceControlForExit();
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
      style={[
        styles.container,
        isLandscape && styles.containerLandscape,
        { backgroundColor: currentInterval.color },
      ]}
    >
      <StatusBar style="light" />

      {/* Full-bleed 60fps liquid-drain progress bar across entire viewport */}
      <Animated.View
        testID="timer-progress-bar"
        pointerEvents="none"
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

      {/* Upper Hero Region (Portrait) / Left 55% Pane (Landscape) */}
      <View
        testID="timer-upper-region"
        style={[
          styles.upperRegion,
          isLandscape
            ? [
                styles.upperRegionLandscape,
                {
                  paddingTop: Math.max(insets.top, Spacing.sm),
                  paddingLeft: Math.max(insets.left, Spacing.lg),
                  paddingBottom: Math.max(insets.bottom, Spacing.md),
                },
              ]
            : {
                paddingTop: Math.max(insets.top, Spacing["3xl"]),
              },
        ]}
      >
        {/* Header Panel */}
        <View style={[styles.header, isLandscape && styles.landscapeInnerPadding]}>
          <TouchableOpacity
            testID="timer-back-button"
            accessibilityRole="button"
            style={styles.backButton}
            onPress={askToCloseWorkout}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textScale.inverse} />
          </TouchableOpacity>
          <Text style={styles.workoutName} numberOfLines={1}>
            {timer.name}
          </Text>
          <View testID="timer-header-right-slot" style={styles.headerRightSlot}>
            {voiceControl.isAvailable ? (
              <TouchableOpacity
                testID="timer-voice-toggle"
                accessibilityRole="button"
                accessibilityLabel={
                  voiceControl.isEnabled
                    ? t("timer.voiceControlDisableLabel")
                    : t("timer.voiceControlEnableLabel")
                }
                accessibilityState={{ selected: voiceControl.isEnabled }}
                style={[
                  styles.voiceToggleButton,
                  voiceControl.isListening && styles.voiceToggleButtonActive,
                ]}
                onPress={voiceControl.toggleVoiceControl}
              >
                <Ionicons
                  name={voiceControl.isEnabled ? "mic" : "mic-off"}
                  size={22}
                  color={
                    voiceControl.isListening
                      ? currentInterval.color
                      : Colors.textScale.inverse
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Timer Details Panel - Hero Centered */}
        <View style={[styles.detailsContainer, isLandscape && styles.landscapeInnerPadding]}>
          <Text
            testID="hero-interval-name"
            style={styles.intervalName}
            numberOfLines={isLandscape ? 2 : undefined}
            adjustsFontSizeToFit={isLandscape}
          >
            {currentInterval.name}
          </Text>
          <Text
            testID="hero-countdown"
            style={[styles.countdown, isLandscape && styles.countdownLandscape]}
          >
            {`${durationLeft}s`}
          </Text>
        </View>

        {/* Compact Bottom Control Bar */}
        <View style={[styles.controlsBar, isLandscape && styles.controlsBarLandscape]}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              {t("timer.roundOf", { current: currentRound, total: timer.rounds })}
            </Text>
            <Text style={styles.metaSubtext}>
              {`Interval ${currentIntervalIndex + 1}/${flatIntervals.length}`}
            </Text>
          </View>

          <TouchableOpacity
            testID="timer-play-pause-button"
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
        isLandscape={isLandscape}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLandscape: {
    flexDirection: "row",
  },
  upperRegion: {
    flex: 1,
    justifyContent: "space-between",
  },
  upperRegionLandscape: {
    flex: 0,
    width: "55%",
    height: "100%",
  },
  landscapeInnerPadding: {
    paddingLeft: 0,
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
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    minHeight: Spacing.touchTarget.min,
    zIndex: 10,
  },
  backButton: {
    width: Spacing.touchTarget.icon,
    height: Spacing.touchTarget.icon,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
  },
  workoutName: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
    opacity: 0.9,
    flex: 1,
    marginLeft: Spacing.xs,
  },
  headerRightSlot: {
    width: Spacing.touchTarget.icon,
    height: Spacing.touchTarget.icon,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceToggleButton: {
    width: Spacing.touchTarget.icon,
    height: Spacing.touchTarget.icon,
    borderRadius: Spacing.radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceToggleButtonActive: {
    backgroundColor: Colors.white,
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
    fontSize: FontSize.countdown,
    lineHeight: FontSize.lineHeight.countdown,
    fontFamily: FontSize.fontFamily.bold,
    color: Colors.textScale.inverse,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  countdownLandscape: {
    fontSize: FontSize.countdownLandscape,
    lineHeight: FontSize.lineHeight.countdownLandscape,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  controlsBarLandscape: {
    paddingLeft: 0,
    paddingBottom: 0,
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
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Spacing.shadows.floating,
  },
});
