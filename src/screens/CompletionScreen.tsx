import React, { useEffect, useState, useMemo } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootStackScreenProps } from "../types";
import { encodeBase64 } from "../utils/base64";
import { recordWorkoutCompletion, recordShare } from "../services/badgeService";
import { getMotivationalCompletionMessage } from "../services/motivationalMessageService";
import { Badge, UserStats } from "../model/Badge";
import { getLocalizedBadge } from "../constants/badges";
import { t } from "../i18n";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

export default function CompletionScreen({
  route,
  navigation,
}: RootStackScreenProps<"Completion">) {
  const insets = useSafeAreaInsets();
  const { timer } = route.params;

  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [activeModalBadge, setActiveModalBadge] = useState<Badge | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [actionsHeight, setActionsHeight] = useState<number>(0);

  // Calculate total seconds worked
  const totalSeconds = timer.intervals.reduce((sum, int) => sum + int.duration, 0) * timer.rounds;

  // Format seconds to mm:ss
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Play fanfare victory audio on screen load
  useEffect(() => {
    let soundObj: Audio.Sound | null = null;
    async function playFanfare() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/fanfare.mp3")
        );
        soundObj = sound;
        await sound.playAsync();
      } catch (e) {
        console.warn("Failed to play fanfare sound:", e);
      }
    }
    playFanfare();

    return () => {
      if (soundObj) {
        soundObj.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Record workout completion and check for new badges
  useEffect(() => {
    async function processCompletion() {
      try {
        const { newlyUnlocked, stats } = await recordWorkoutCompletion(timer, totalSeconds);
        setUserStats(stats);

        if (newlyUnlocked.length > 0) {
          const localizedList = newlyUnlocked.map(getLocalizedBadge);
          setNewlyUnlockedBadges(localizedList);
          setActiveModalBadge(localizedList[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.warn("Failed to record workout completion stats:", error);
      }
    }
    processCompletion();
  }, []);

  // Handle native sharing triggers
  async function handleShare() {
    try {
      const sharePayload = {
        name: timer.name,
        rounds: timer.rounds,
        isAiGenerated: timer.isAiGenerated,
        intervals: timer.intervals.map((int) => ({
          name: int.name,
          duration: int.duration,
          color: int.color,
          exerciseId: int.exerciseId,
        })),
      };

      const base64Data = encodeBase64(JSON.stringify(sharePayload));
      const deepLink = `interval://import?data=${base64Data}`;
      
      const appStoreLink = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.plyonest.interval";

      const streakText = userStats && userStats.currentStreak > 0
        ? t("completion.shareStreakText", { streak: userStats.currentStreak })
        : "";
      const badgeText = newlyUnlockedBadges.length > 0
        ? t("completion.shareBadgeText", { badges: newlyUnlockedBadges.map(b => b.name).join(", ") })
        : "";

      const shareMessage = t("completion.shareMessage", {
        name: timer.name,
        rounds: timer.rounds,
        duration: formatTime(totalSeconds),
        streakText,
        badgeText,
        appStoreLink,
        playStoreLink,
        deepLink,
      });

      const result = await Share.share({
        message: shareMessage,
        title: t("completion.shareWorkoutTitle", { name: timer.name }),
      });

      if (result.action === Share.sharedAction) {
        const { newlyUnlocked, stats } = await recordShare(result.activityType);
        setUserStats(stats);
        if (newlyUnlocked.length > 0) {
          const localizedList = newlyUnlocked.map(getLocalizedBadge);
          setNewlyUnlockedBadges((prev) => [...prev, ...localizedList]);
          setActiveModalBadge(localizedList[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.warn("Error sharing workout:", error);
    }
  }

  async function handleShareBadge(badge: Badge) {
    try {
      const appStoreLink = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.plyonest.interval";
      
      const streakText = userStats && userStats.currentStreak > 0 ? ` (🔥 ${userStats.currentStreak}-Day Streak!)` : "";
      const message = t("completion.shareBadgeMessage", {
        name: badge.name,
        streakText,
        description: badge.description,
        appStoreLink,
        playStoreLink,
      });

      const result = await Share.share({
        message,
        title: badge.name,
      });

      if (result.action === Share.sharedAction) {
        const { newlyUnlocked, stats } = await recordShare(result.activityType);
        setUserStats(stats);
        if (newlyUnlocked.length > 0) {
          const localizedList = newlyUnlocked.map(getLocalizedBadge);
          setNewlyUnlockedBadges((prev) => [...prev, ...localizedList]);
          setActiveModalBadge(localizedList[0]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.warn("Error sharing badge:", error);
    }
  }

  const motivationalMessage = useMemo(() => {
    return getMotivationalCompletionMessage({
      durationSeconds: totalSeconds,
      rounds: timer.rounds,
    });
  }, [totalSeconds, timer.rounds]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (actionsHeight || 180) + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#FFFBEB", "#FEF3C7"]}
          style={styles.celebrationBg}
        >
          <View style={styles.trophyContainer}>
            <View style={styles.trophyBubble}>
              <Ionicons name="trophy" size={44} color="#F59E0B" />
            </View>
          </View>

          <Text style={styles.title}>{t("completion.title")}</Text>
          <Text style={styles.subtitle}>{motivationalMessage}</Text>
        </LinearGradient>

        {/* Workout Stats Details */}
        <View style={styles.statsCard}>
          <Text style={styles.workoutTitle}>{timer.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t("completion.totalTime")}</Text>
              <Text style={styles.statValue}>{formatTime(totalSeconds)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t("common.rounds")}</Text>
              <Text style={styles.statValue}>{timer.rounds} {t("common.rounds")}</Text>
            </View>
            {userStats && userStats.currentStreak > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t("awards.currentStreak")}</Text>
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
              {t("completion.intervalsCompleted")}: {timer.intervals.length * timer.rounds}
            </Text>
          </View>
        </View>

        {/* Newly Unlocked Badges Section */}
        {newlyUnlockedBadges.length > 0 && (
          <View style={styles.unlockedSection}>
            <View style={styles.unlockedSectionHeader}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
              <Text style={styles.unlockedSectionTitle}>{t("completion.newBadgeUnlocked")}</Text>
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
      </ScrollView>

      {/* Floating Bottom Action Buttons */}
      <View
        style={[
          styles.actionsContainer,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        ]}
        onLayout={(e) => setActionsHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity
          style={styles.shareButtonContainer}
          activeOpacity={0.9}
          onPress={handleShare}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            style={styles.shareButton}
          >
            <Ionicons name="share-social" size={20} color={Colors.white} style={styles.icon} />
            <Text style={styles.shareButtonText}>{t("completion.shareWorkout")}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.trophyRoomButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Awards")}
        >
          <Ionicons name="trophy-outline" size={18} color="#D97706" style={styles.icon} />
          <Text style={styles.trophyRoomButtonText}>{t("awards.title")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.8}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.doneButtonText}>{t("completion.doneButton")}</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={styles.modalBadgeHeaderText}>{t("completion.newBadgeUnlocked").toUpperCase()}</Text>
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
                  <Text style={styles.modalShareText}>{t("completion.shareBadge")}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalContinueBtn}
                activeOpacity={0.8}
                onPress={() => setActiveModalBadge(null)}
              >
                <Text style={styles.modalContinueText}>{t("common.ok")}</Text>
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
    backgroundColor: Colors.surface.screen,
  },
  scrollContent: {
    paddingBottom: Spacing["2xl"],
  },
  celebrationBg: {
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: Spacing["2xl"],
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOWS.card,
  },
  trophyContainer: {
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  trophyBubble: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.surface.card,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.card,
  },
  title: {
    fontSize: FontSize["2xl"],
    lineHeight: FontSize.lineHeight["2xl"],
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: Colors.textScale.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
  statsCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    ...SHADOWS.card,
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface.screen,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  shareButtonContainer: {
    minHeight: TOUCH_TARGET.cta,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  shareButton: {
    width: "100%",
    minHeight: TOUCH_TARGET.cta,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  shareButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    textAlign: "center",
  },
  trophyRoomButton: {
    minHeight: TOUCH_TARGET.cta,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: RADIUS.md,
    backgroundColor: "#FEF3C7",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  trophyRoomButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    textAlign: "center",
  },
  doneButton: {
    minHeight: TOUCH_TARGET.min,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.secondary,
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
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: Spacing.sm,
    ...SHADOWS.card,
  },
  modalShareGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: TOUCH_TARGET.cta,
    gap: Spacing.sm,
  },
  modalShareText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  modalContinueBtn: {
    width: "100%",
    minHeight: TOUCH_TARGET.cta,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.md,
    backgroundColor: Colors.neutralAction.surface,
  },
  modalContinueText: {
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
  },
});

