import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

import { RootStackScreenProps } from "../types";
import { Interval } from "../model/Interval";
import { EXERCISE_CATALOG } from "../constants/exerciseCatalog";
import { Exercise } from "../model/Exercise";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export default function TimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"Timer">) {
  const { timer } = route.params;

  // Sound State
  const [beep1, setBeep1] = useState<Audio.Sound>();
  const [beep2, setBeep2] = useState<Audio.Sound>();

  // Flat list of intervals across all rounds
  const [flatIntervals, setFlatIntervals] = useState<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [durationLeft, setDurationLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for timer loops
  const timerIdRef = useRef<any>(undefined);
  const currentIndexRef = useRef(0);
  const durationLeftRef = useRef(0);
  const isPausedRef = useRef(false);

  const currentInterval = flatIntervals[currentIntervalIndex];

  // Find Exercise metadata if referenced
  let exercise: Exercise | undefined;
  if (currentInterval?.exerciseId) {
    exercise = EXERCISE_CATALOG.find((ex) => ex.id === currentInterval.exerciseId);
  }

  // Initialize expo-video player
  const player = useVideoPlayer("", (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = true;
  });

  // Keep player in sync with current exercise and pause state
  useEffect(() => {
    if (exercise?.videoUrl) {
      player.replace(exercise.videoUrl);
      player.loop = true;
      player.muted = true;
      if (!isPaused) {
        player.play();
      } else {
        player.pause();
      }
    } else {
      player.pause();
    }
  }, [exercise?.id, isPaused]);

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
    setFlatIntervals(list);
    
    if (list.length > 0) {
      setCurrentIntervalIndex(0);
      currentIndexRef.current = 0;
      setDurationLeft(list[0].duration);
      durationLeftRef.current = list[0].duration * 1000;
      setTotalDuration(list[0].duration * 1000);
    }

    loadSounds();
    isPausedRef.current = false;
    startCountDown();

    return () => {
      clearInterval(timerIdRef.current);
      unloadSounds();
    };
  }, [timer]);

  async function loadSounds(): Promise<void> {
    try {
      const b1 = await Audio.Sound.createAsync(
        require("../../assets/sounds/beep_1.mp3")
      );
      setBeep1(b1.sound);

      const b2 = await Audio.Sound.createAsync(
        require("../../assets/sounds/beep_2.mp3")
      );
      setBeep2(b2.sound);
    } catch (e) {
      console.warn("Failed to load audio beeps:", e);
    }
  }

  async function unloadSounds(): Promise<void> {
    if (beep1) await beep1.unloadAsync();
    if (beep2) await beep2.unloadAsync();
  }

  function startCountDown(): void {
    clearInterval(timerIdRef.current);
    const tickMs = 100; // tick every 100ms for smoothness

    timerIdRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      durationLeftRef.current -= tickMs;

      // Handle sound play at 3s, 2s, 1s remaining
      const secLeft = Math.ceil(durationLeftRef.current / 1000);
      const exactSecond = durationLeftRef.current % 1000 === 0;

      if (exactSecond) {
        if (secLeft === 3 || secLeft === 2 || secLeft === 1) {
          beep1?.replayAsync().catch(() => {});
        } else if (secLeft === 0) {
          beep2?.replayAsync().catch(() => {});
        }
      }

      setDurationLeft(Math.max(0, secLeft));

      if (durationLeftRef.current <= 0) {
        // Move to next interval
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx >= flatIntervals.length) {
          // Workout finished!
          clearInterval(timerIdRef.current);
          navigation.replace("Completion", { timer });
        } else {
          currentIndexRef.current = nextIdx;
          setCurrentIntervalIndex(nextIdx);
          const nextInt = flatIntervals[nextIdx];
          durationLeftRef.current = (nextInt.duration || 0) * 1000;
          setDurationLeft(nextInt.duration || 0);
          setTotalDuration((nextInt.duration || 0) * 1000);
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
  }

  function askToCloseWorkout() {
    const wasPaused = isPausedRef.current;
    isPausedRef.current = true;
    setIsPaused(true);

    Alert.alert(
      "Exit Workout?",
      "Are you sure you want to stop this workout and return to the dashboard?",
      [
        {
          text: "Stay Here",
          style: "cancel",
          onPress: () => {
            setIsPaused(wasPaused);
            isPausedRef.current = wasPaused;
          }
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            clearInterval(timerIdRef.current);
            navigation.popToTop();
          }
        }
      ]
    );
  }

  if (!currentInterval) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Text>Preparing workout...</Text>
      </View>
    );
  }

  // Calculate remaining timer bar height
  const timerBarHeight = totalDuration > 0
    ? (durationLeftRef.current / totalDuration) * 100
    : 100;

  return (
    <View style={[styles.container, { backgroundColor: currentInterval.color }]}>
      <StatusBar style="light" />

      {/* Progress background bar */}
      <View style={[styles.timerBar, { height: `${timerBarHeight}%` }]} />

      {/* Header Panel */}
      <View style={styles.header}>
        <Text style={styles.workoutName}>{timer.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={askToCloseWorkout}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Display Video Player if active exercise */}
      <View style={styles.mediaContainer}>
        {exercise ? (
          <View style={styles.videoCard}>
            <VideoView
              player={player}
              style={styles.videoPlayer}
              allowsFullscreen={false}
              nativeControls={false}
            />
          </View>
        ) : (
          <View style={styles.restPlaceholder}>
            <Ionicons name="body-outline" size={60} color="#FFFFFF" style={styles.pulseIcon} />
            <Text style={styles.restText}>Catch your breath</Text>
          </View>
        )}
      </View>

      {/* Timer Details Panel */}
      <View style={styles.detailsContainer}>
        <Text style={styles.intervalName}>{currentInterval.name}</Text>
        <Text style={styles.countdown}>{durationLeft}s</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Round {currentRound} of {timer.rounds}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>
            Interval {currentIntervalIndex + 1}/{flatIntervals.length}
          </Text>
        </View>

        {nextInterval && (
          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpLabel}>NEXT UP</Text>
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
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  videoCard: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: Spacing.radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  restPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  restText: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  pulseIcon: {
    opacity: 0.8,
  },
  detailsContainer: {
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
    fontSize: 88,
    lineHeight: 96,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    marginVertical: Spacing.sm,
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
