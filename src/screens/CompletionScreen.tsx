import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

import { RootStackScreenProps } from "../types";
import { encodeBase64 } from "../utils/base64";
import { recordWorkoutCompletion, recordShare } from "../services/badgeService";
import { getMotivationalCompletionMessage } from "../services/motivationalMessageService";
import { Badge, UserStats } from "../model/Badge";
import { getLocalizedBadge } from "../constants/badges";
import { resolveSoundSource } from "../constants/Sounds";
import { t } from "../i18n";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

const APP_STORE_LINK = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.plyonest.interval";

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

  // Play completion triple beep on mount
  useEffect(() => {
    let player: ReturnType<typeof createAudioPlayer> | null = null;
    const source = resolveSoundSource("beep_3");
    if (source) {
      try {
        setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: "mixWithOthers",
        }).catch(() => {});
        player = createAudioPlayer(source);
        player.play();
      } catch (error) {
        console.warn("Failed to play completion sound:", error);
      }
    }
    return () => {
      if (player) {
        try {
          player.release();
        } catch {
          // ignore cleanup errors
        }
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
          sound: int.sound,
        })),
      };

      const base64Data = encodeBase64(JSON.stringify(sharePayload));
      const deepLink = `interval://import?data=${base64Data}`;

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
        appStoreLink: APP_STORE_LINK,
        playStoreLink: PLAY_STORE_LINK,
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

  async function handleRateApp() {
    try {
      const storeUrl = Platform.OS === "ios" ? APP_STORE_LINK : PLAY_STORE_LINK;
      await Linking.openURL(storeUrl);
    } catch (error) {
      console.warn("Error opening store link:", error);
    }
  }

  async function handleShareBadge(badge: Badge) {
    try {
      const streakText = userStats && userStats.currentStreak > 0 ? ` (🔥 ${userStats.currentStreak}-Day Streak!)` : "";
      const message = t("completion.shareBadgeMessage", {
        name: badge.name,
        streakText,
        description: badge.description,
        appStoreLink: APP_STORE_LINK,
        playStoreLink: PLAY_STORE_LINK,
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

  const unlockedTitle =
    newlyUnlockedBadges.length === 1
      ? t("completion.newAchievementUnlocked")
      : t("completion.newAchievementsUnlocked");

  const shareIconName =
    Platform.OS === "ios" ? "share-outline" : "share-social-outline";

  function renderTrophyButton() {
    return (
      <TouchableOpacity
        testID="btn-completion-achievements"
        accessibilityLabel={t("awards.title")}
        style={styles.trophyIconWrap}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Awards")}
      >
        <Ionicons name="trophy" size={22} color="#F59E0B" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Upper-Right Close Button */}
      <TouchableOpacity
        testID="btn-close-completion"
        accessibilityLabel={t("common.close")}
        style={[
          styles.closeHeaderButton,
          { top: Math.max(insets.top, Spacing.md) + Spacing.xs },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.popToTop()}
      >
        <Ionicons name="close" size={24} color={Colors.textScale.primary} />
      </TouchableOpacity>

      {/* Pinned Top Celebration Banner */}
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

      {/* Pinned Workout Stats Details */}
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

      {/* Newly Unlocked Badges Section or Centered Trophy Button */}
      {newlyUnlockedBadges.length > 0 ? (
        <View style={styles.unlockedSection}>
          <View testID="unlocked-section-header" style={styles.unlockedSectionHeader}>
            <View style={styles.unlockedSectionTitleRow}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
              <Text style={styles.unlockedSectionTitle}>{unlockedTitle}</Text>
            </View>
            {renderTrophyButton()}
          </View>
          <ScrollView
            testID="unlocked-badges-scroll"
            style={styles.unlockedBadgesScroll}
            contentContainerStyle={[
              styles.badgeCardsRow,
              { paddingBottom: (actionsHeight || 100) + Spacing.md },
            ]}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
        </View>
      ) : (
        <View testID="centered-trophy-row" style={styles.centeredTrophyRow}>
          {renderTrophyButton()}
        </View>
      )}

      {/* Condensed Rounded Blue Bottom Action Pill */}
      <View
        style={[
          styles.actionsContainer,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        ]}
        onLayout={(e) => setActionsHeight(e.nativeEvent.layout.height)}
      >
        <View testID="completion-action-bar" style={styles.actionPillCard}>
          <TouchableOpacity
            testID="btn-restart-workout"
            accessibilityLabel={t("completion.restartWorkout")}
            style={styles.actionIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.replace("Timer", { timer })}
          >
            <MaterialIcons name="replay" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.actionPillDivider} />

          <TouchableOpacity
            testID="btn-share-workout"
            accessibilityLabel={t("completion.shareWorkout")}
            style={styles.actionIconButton}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Ionicons name={shareIconName} size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.actionPillDivider} />

          <TouchableOpacity
            testID="btn-rate-app"
            accessibilityLabel={t("completion.rateApp")}
            style={styles.actionIconButton}
            activeOpacity={0.8}
            onPress={handleRateApp}
          >
            <MaterialIcons name="rate-review" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Celebratory Award Unlock Popup Modal */}
      {activeModalBadge && (
        <Modal
          visible={Boolean(activeModalBadge)}
          transparent
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setActiveModalBadge(null)}
        >
          <Pressable
            testID="modal-overlay"
            style={styles.modalOverlay}
            onPress={() => setActiveModalBadge(null)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalBadgeHeaderPill}>
                <Ionicons name="sparkles" size={14} color="#D97706" />
                <Text style={styles.modalBadgeHeaderText}>
                  {t("completion.newAchievementUnlocked").toUpperCase()}
                </Text>
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
            </Pressable>
          </Pressable>
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
  closeHeaderButton: {
    position: "absolute",
    right: Spacing.md,
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
  trophyIconWrap: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  centeredTrophyRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  unlockedSection: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  unlockedSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  unlockedBadgesScroll: {
    flex: 1,
  },
  unlockedSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
    marginRight: Spacing.sm,
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
    marginHorizontal: Spacing.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: Spacing.md,
    ...SHADOWS.card,
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
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
  },
  actionPillCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.primary,
    borderRadius: RADIUS.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: TOUCH_TARGET.cta,
    ...SHADOWS.floating,
  },
  actionIconButton: {
    flex: 1,
    height: TOUCH_TARGET.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPillDivider: {
    width: 1,
    height: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.surface.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    padding: Spacing.xl,
    alignItems: "center",
    ...SHADOWS.modal,
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
