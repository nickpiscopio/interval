import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
  Modal,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { RootStackScreenProps } from "../types";
import { encodeBase64 } from "../utils/base64";
import { recordWorkoutCompletion, recordShare } from "../services/badgeService";
import { Badge, UserStats } from "../model/Badge";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export default function CompletionScreen({
  route,
  navigation,
}: RootStackScreenProps<"Completion">) {
  const { timer } = route.params;

  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [activeModalBadge, setActiveModalBadge] = useState<Badge | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Calculate total seconds worked
  const totalSeconds = timer.intervals.reduce((sum, int) => sum + int.duration, 0) * timer.rounds;

  // Play single completion beep and record workout for badge unlocks
  useEffect(() => {
    let sound: Audio.Sound | null = null;

    async function initCompletion() {
      try {
        const loaded = await Audio.Sound.createAsync(
          require("../../assets/sounds/beep_3.mp3")
        );
        sound = loaded.sound;
        await sound.replayAsync().catch(() => {});
      } catch (e) {
        console.warn("Failed to play completion beep:", e);
      }

      // Record workout stats and evaluate badge unlocks
      try {
        const { newlyUnlocked, stats } = await recordWorkoutCompletion(timer, totalSeconds);
        setUserStats(stats);
        if (newlyUnlocked.length > 0) {
          setNewlyUnlockedBadges(newlyUnlocked);
          setActiveModalBadge(newlyUnlocked[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (err) {
        console.warn("Failed to record completion awards:", err);
      }
    }

    initCompletion();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

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

      const streakText = userStats && userStats.currentStreak > 0 ? `\nStreak: 🔥 ${userStats.currentStreak}-Day Streak` : "";
      const badgeText = newlyUnlockedBadges.length > 0 ? `\nUnlocked: 🏆 ${newlyUnlockedBadges.map(b => b.name).join(", ")}` : "";

      const shareMessage = `I just smashed my workout using Interval! ⚡️\n\nTimer: "${timer.name}" (${timer.rounds} rounds, ${formatTime(totalSeconds)} duration)${streakText}${badgeText}\n\n1. Download the app:\nApp Store: ${appStoreLink}\nPlay Store: ${playStoreLink}\n\n2. Open this link to load the timer:\n${deepLink}`;

      const result = await Share.share({
        message: shareMessage,
        title: `Share Workout: ${timer.name}`,
      });

      if (result.action === Share.sharedAction) {
        const { newlyUnlocked, stats } = await recordShare(result.activityType);
        setUserStats(stats);
        if (newlyUnlocked.length > 0) {
          setNewlyUnlockedBadges((prev) => [...prev, ...newlyUnlocked]);
          setActiveModalBadge(newlyUnlocked[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.warn("Error sharing workout:", error);
    }
  }

  async function handleShareBadge(badge: Badge) {
    try {
      const appStoreLink = "https://apps.apple.com/app/hiit-interval-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.interval.hiittimer";
      
      const streakText = userStats && userStats.currentStreak > 0 ? ` (🔥 ${userStats.currentStreak}-Day Streak!)` : "";
      const message = `🏆 I just earned the "${badge.name}" badge${streakText} on Interval!\n\n"${badge.description}"\n\nCrush your fitness goals with custom HIIT interval timers:\nApp Store: ${appStoreLink}\nPlay Store: ${playStoreLink}`;

      const result = await Share.share({
        message,
        title: `Badge Unlocked: ${badge.name}`,
      });

      if (result.action === Share.sharedAction) {
        const { newlyUnlocked, stats } = await recordShare(result.activityType);
        setUserStats(stats);
        if (newlyUnlocked.length > 0) {
          setNewlyUnlockedBadges((prev) => [...prev, ...newlyUnlocked]);
          setActiveModalBadge(newlyUnlocked[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.warn("Error sharing badge:", error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#FFFBEB", "#FEF3C7"]}
          style={styles.celebrationBg}
        >
          <View style={styles.trophyContainer}>
            <Ionicons name="trophy" size={90} color="#F59E0B" />
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
            {userStats && userStats.currentStreak > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Streak</Text>
                  <Text style={[styles.statValue, { color: "#D97706" }]}>
                    🔥 {userStats.currentStreak}d
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="fitness-outline" size={18} color="#4B5563" />
            <Text style={styles.infoText}>
              Completed {timer.intervals.filter(i => i.exerciseId).length * timer.rounds} active exercise intervals!
            </Text>
          </View>
        </View>

        {/* Newly Unlocked Badges Section */}
        {newlyUnlockedBadges.length > 0 && (
          <View style={styles.unlockedSection}>
            <View style={styles.unlockedSectionHeader}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
              <Text style={styles.unlockedSectionTitle}>New Awards Unlocked!</Text>
            </View>
            <View style={styles.badgeCardsRow}>
              {newlyUnlockedBadges.map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={styles.unlockedBadgeCard}
                  activeOpacity={0.85}
                  onPress={() => setActiveModalBadge(badge)}
                >
                  <LinearGradient
                    colors={badge.gradientColors}
                    style={styles.unlockedBadgeBubble}
                  >
                    <Text style={styles.unlockedBadgeEmoji}>{badge.emoji}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unlockedBadgeName}>{badge.name}</Text>
                    <Text style={styles.unlockedBadgeTagline}>{badge.tagline}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
            style={styles.trophyRoomButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Awards")}
          >
            <Ionicons name="trophy-outline" size={18} color="#D97706" style={styles.icon} />
            <Text style={styles.trophyRoomButtonText}>View All Awards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.8}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Celebratory Award Unlock Popup Modal */}
      {activeModalBadge && (
        <Modal
          visible={Boolean(activeModalBadge)}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveModalBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalBadgeHeaderPill}>
                <Ionicons name="sparkles" size={14} color="#D97706" />
                <Text style={styles.modalBadgeHeaderText}>NEW BADGE UNLOCKED!</Text>
              </View>

              <LinearGradient
                colors={activeModalBadge.gradientColors}
                style={styles.modalBadgeIcon}
              >
                <Text style={styles.modalBadgeEmoji}>{activeModalBadge.emoji}</Text>
              </LinearGradient>

              <Text style={styles.modalBadgeName}>{activeModalBadge.name}</Text>
              <Text style={styles.modalBadgeTagline}>{activeModalBadge.tagline}</Text>
              <Text style={styles.modalBadgeDesc}>{activeModalBadge.description}</Text>

              <TouchableOpacity
                style={styles.modalShareBtn}
                activeOpacity={0.9}
                onPress={() => handleShareBadge(activeModalBadge)}
              >
                <LinearGradient
                  colors={["#3B82F6", "#1D4ED8"]}
                  style={styles.modalShareGradient}
                >
                  <Ionicons name="share-social" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalShareText}>Share Badge 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalContinueBtn}
                activeOpacity={0.8}
                onPress={() => setActiveModalBadge(null)}
              >
                <Text style={styles.modalContinueText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: Spacing["2xl"],
  },
  celebrationBg: {
    alignItems: "center",
    paddingTop: 70,
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
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    letterSpacing: 2,
    marginTop: Spacing.xs,
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
  unlockedSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  unlockedSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  unlockedSectionTitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
  },
  badgeCardsRow: {
    gap: Spacing.sm,
  },
  unlockedBadgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  unlockedBadgeBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockedBadgeEmoji: {
    fontSize: 22,
  },
  unlockedBadgeName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
  },
  unlockedBadgeTagline: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  actionsContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
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
  trophyRoomButton: {
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
    backgroundColor: "#FEF3C7",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  trophyRoomButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    textAlign: "center",
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
  icon: {
    marginRight: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalBadgeHeaderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    marginBottom: Spacing.md,
  },
  modalBadgeHeaderText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    letterSpacing: 1,
  },
  modalBadgeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalBadgeEmoji: {
    fontSize: 44,
  },
  modalBadgeName: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.lineHeight.xl,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    textAlign: "center",
  },
  modalBadgeTagline: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#3B82F6",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalBadgeDesc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  modalShareBtn: {
    width: "100%",
    borderRadius: Spacing.radius.md,
    overflow: "hidden",
    marginBottom: Spacing.sm,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalShareGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: Spacing.touchTarget.cta,
  },
  modalShareText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  modalContinueBtn: {
    width: "100%",
    minHeight: Spacing.touchTarget.cta,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Spacing.radius.md,
    backgroundColor: "#F3F4F6",
  },
  modalContinueText: {
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Bold",
    color: "#4B5563",
  },
});

