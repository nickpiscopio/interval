import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Share } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackScreenProps } from "../types";
import { encodeBase64 } from "../utils/base64";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export default function CompletionScreen({
  route,
  navigation,
}: RootStackScreenProps<"Completion">) {
  const { timer } = route.params;

  // Play single completion beep on mount
  useEffect(() => {
    let sound: Audio.Sound | null = null;

    async function playCompletionBeep() {
      try {
        const loaded = await Audio.Sound.createAsync(
          require("../../assets/sounds/beep_3.mp3")
        );
        sound = loaded.sound;
        await sound.replayAsync().catch(() => {});
      } catch (e) {
        console.warn("Failed to play completion beep:", e);
      }
    }

    playCompletionBeep();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Calculate total seconds worked
  const totalSeconds = timer.intervals.reduce((sum, int) => sum + int.duration, 0) * timer.rounds;

  function formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
    }
    return `${secs}s`;
  }

  // Handle native sharing triggers
  async function handleShare() {
    try {
      // Create a clean payload to keep query parameter small
      const sharePayload = {
        name: timer.name,
        rounds: timer.rounds,
        intervals: timer.intervals.map((int) => ({
          name: int.name,
          duration: int.duration,
          color: int.color,
          exerciseId: int.exerciseId,
        })),
      };

      const base64Data = encodeBase64(JSON.stringify(sharePayload));
      const deepLink = `interval://import?data=${base64Data}`;
      
      const appStoreLink = "https://apps.apple.com/app/hiit-interval-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.interval.hiittimer";

      const shareMessage = `I just smashed my workout using Interval! ⚡️\n\nTry my custom timer "${timer.name}" (${timer.rounds} rounds, ${formatTime(totalSeconds)} duration):\n\n1. Download the app:\nApp Store: ${appStoreLink}\nPlay Store: ${playStoreLink}\n\n2. Open this link to load the timer:\n${deepLink}`;

      await Share.share({
        message: shareMessage,
        title: `Share Workout: ${timer.name}`,
      });
    } catch (error) {
      console.warn("Error sharing workout:", error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <LinearGradient
        colors={["#FFFBEB", "#FEF3C7"]}
        style={styles.celebrationBg}
      >
        <View style={styles.trophyContainer}>
          <Ionicons name="trophy" size={100} color="#F59E0B" />
          <Text style={styles.badgeText}>COMPLETED</Text>
        </View>

        <Text style={styles.title}>You Crushed It! 🎉</Text>
        <Text style={styles.subtitle}>Another successful HIIT session in the books.</Text>
      </LinearGradient>

      {/* Workout Stats Details */}
      <View style={styles.statsCard}>
        <Text style={styles.workoutTitle}>{timer.name}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{formatTime(totalSeconds)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rounds</Text>
            <Text style={styles.statValue}>{timer.rounds} Rounds</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="fitness-outline" size={18} color="#4B5563" />
          <Text style={styles.infoText}>
            Completed {timer.intervals.filter(i => i.exerciseId).length * timer.rounds} active exercise intervals!
          </Text>
        </View>
      </View>

      {/* Share / Back buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.shareButtonContainer}
          activeOpacity={0.9}
          onPress={handleShare}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            style={styles.shareButton}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" style={styles.icon} />
            <Text style={styles.shareButtonText}>Share Workout with Friends</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.8}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "space-between",
  },
  celebrationBg: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: Spacing["2xl"],
    borderBottomLeftRadius: Spacing.xl,
    borderBottomRightRadius: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  trophyContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    letterSpacing: 2,
    marginTop: Spacing.sm,
    backgroundColor: "#FEF3C7",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.sm,
    overflow: "hidden",
  },
  title: {
    fontSize: FontSize["2xl"],
    lineHeight: FontSize.lineHeight["2xl"],
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing["2xl"],
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: -Spacing.md,
  },
  workoutTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.lineHeight.xl,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: Spacing.md,
    justifyContent: "center",
  },
  infoText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
    flexShrink: 1,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  shareButtonContainer: {
    minHeight: Spacing.touchTarget.cta,
    borderRadius: Spacing.radius.md,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButton: {
    width: "100%",
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  icon: {
    marginRight: Spacing.xs,
  },
  doneButton: {
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#4B5563",
    textAlign: "center",
  },
});
