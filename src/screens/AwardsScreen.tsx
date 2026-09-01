import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootStackScreenProps } from "../types";
import { Badge, UserStats } from "../model/Badge";
import { getAllBadgesWithStatus, getUserStats, recordShare } from "../services/badgeService";
import { getLocalizedBadge } from "../constants/badges";
import { t } from "../i18n";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

export default function AwardsScreen({ navigation }: RootStackScreenProps<"Awards">) {
  const insets = useSafeAreaInsets();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [allBadges, userStats] = await Promise.all([
      getAllBadgesWithStatus(),
      getUserStats(),
    ]);
    setBadges(allBadges.map(getLocalizedBadge));
    setStats(userStats);
  }

  function handleSelectBadge(badge: Badge) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBadge(badge);
  }

  async function handleShareBadge(badge: Badge) {
    try {
      const appStoreLink = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.plyonest.interval";
      
      const streakText = stats && stats.currentStreak > 0 ? ` (🔥 ${stats.currentStreak}-Day Streak!)` : "";
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
        const { newlyUnlocked, stats: updatedStats } = await recordShare(result.activityType);
        setStats(updatedStats);
        await loadData();
        if (newlyUnlocked.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSelectedBadge(getLocalizedBadge(newlyUnlocked[0]));
        }
      }
    } catch (error) {
      console.warn("Error sharing badge:", error);
    }
  }

  async function handleShareApp() {
    try {
      const appStoreLink = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.plyonest.interval";
      const message = t("awards.shareAppMessage", {
        appStoreLink,
        playStoreLink,
      });

      const result = await Share.share({
        message,
        title: t("awards.shareAppTitle"),
      });

      if (result.action === Share.sharedAction) {
        const { newlyUnlocked, stats: updatedStats } = await recordShare(result.activityType);
        setStats(updatedStats);
        await loadData();
        if (newlyUnlocked.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSelectedBadge(getLocalizedBadge(newlyUnlocked[0]));
        }
      }
    } catch (e) {
      console.warn("Failed to share app:", e);
    }
  }

  function formatDuration(totalSec: number): string {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + Spacing.xs }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textScale.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("awards.title")}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {isScrolled && (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.05)", "transparent"]}
          style={[styles.headerShadowGradient, { top: headerHeight }]}
          pointerEvents="none"
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 0)}
        scrollEventThrottle={16}
      >
        {/* User Stats Overview Banner */}
        <LinearGradient
          colors={["#1F2937", "#111827"]}
          style={styles.statsCard}
        >
          <View style={styles.streakHero}>
            <View style={styles.streakIconWrap}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View>
              <Text style={styles.streakCount}>
                {stats?.currentStreak || 0} {t("common.days")}
              </Text>
              <Text style={styles.streakLabel}>{t("awards.currentStreak")}</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statMetricsRow}>
            <View style={styles.statMetric}>
              <Text style={styles.statMetricValue}>{unlockedCount}/{badges.length}</Text>
              <Text style={styles.statMetricLabel}>{t("awards.badgesLabel")}</Text>
            </View>
            <View style={styles.statMetric}>
              <Text style={styles.statMetricValue}>{stats?.totalWorkouts || 0}</Text>
              <Text style={styles.statMetricLabel}>{t("awards.totalWorkouts")}</Text>
            </View>
            <View style={styles.statMetric}>
              <Text style={styles.statMetricValue}>{formatDuration(stats?.totalSeconds || 0)}</Text>
              <Text style={styles.statMetricLabel}>{t("awards.totalTime")}</Text>
            </View>
            <View style={styles.statMetric}>
              <Text style={styles.statMetricValue}>{stats?.totalShares || 0}</Text>
              <Text style={styles.statMetricLabel}>{t("common.share")}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Invite Friends & Viral Rewards Banner */}
        <TouchableOpacity
          style={styles.inviteBanner}
          activeOpacity={0.9}
          onPress={handleShareApp}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            style={styles.inviteBannerGradient}
          >
            <View style={styles.inviteBannerIconWrap}>
              <Ionicons name="gift" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inviteBannerTitle}>{t("awards.inviteBannerTitle")} 🚀</Text>
              <Text style={styles.inviteBannerSubtitle}>
                {t("awards.inviteBannerSubtitle")}
              </Text>
            </View>
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Badges Collection Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>{t("awards.title")}</Text>
          <Text style={styles.sectionSubtitle}>{t("awards.unlockedCount", { unlocked: unlockedCount, total: badges.length })}</Text>

          <View style={styles.badgeGrid}>
            {badges.map((badge) => {
              const isUnlocked = Boolean(badge.unlockedAt);
              return (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}
                  activeOpacity={0.85}
                  onPress={() => handleSelectBadge(badge)}
                >
                  {isUnlocked ? (
                    <LinearGradient
                      colors={badge.gradientColors}
                      style={styles.badgeIconBubble}
                    >
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.badgeIconLocked}>
                      <Ionicons name="lock-closed" size={28} color="#9CA3AF" />
                    </View>
                  )}

                  <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]} numberOfLines={2}>
                    {badge.name}
                  </Text>

                  {isUnlocked ? (
                    <View style={styles.unlockedTag}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.unlockedTagText}>{t("common.done")}</Text>
                    </View>
                  ) : (
                    <Text style={styles.lockedHintText} numberOfLines={1}>
                      {t("awards.locked")}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Badge Detail & Share Modal */}
      {selectedBadge && (
        <Modal
          visible={Boolean(selectedBadge)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedBadge(null)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>

              {selectedBadge.unlockedAt ? (
                <LinearGradient
                  colors={selectedBadge.gradientColors}
                  style={styles.modalBadgeIcon}
                >
                  <Text style={styles.modalBadgeEmoji}>{selectedBadge.emoji}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.modalBadgeIconLocked}>
                  <Ionicons name="lock-closed" size={48} color="#9CA3AF" />
                </View>
              )}

              <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
              <Text style={styles.modalBadgeTagline}>{selectedBadge.tagline}</Text>
              <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>

              {selectedBadge.unlockedAt ? (
                <TouchableOpacity
                  style={styles.modalShareBtn}
                  activeOpacity={0.9}
                  onPress={() => handleShareBadge(selectedBadge)}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#1D4ED8"]}
                    style={styles.modalShareGradient}
                  >
                    <Ionicons name="share-social" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalShareText}>{t("awards.shareBadge")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.modalLockedPill}>
                  <Ionicons name="lock-closed" size={16} color="#6B7280" />
                  <Text style={styles.modalLockedPillText}>{t("awards.howToUnlock")}</Text>
                </View>
              )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface.screen,
  },
  headerShadowGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    zIndex: 9,
  },
  backButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  statsCard: {
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  streakHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  streakIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  streakEmoji: {
    fontSize: 28,
  },
  streakCount: {
    fontSize: FontSize["2xl"],
    lineHeight: FontSize.lineHeight["2xl"],
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  streakLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
  },
  statDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statMetric: {
    alignItems: "center",
  },
  statMetricValue: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#F3F4F6",
  },
  statMetricLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  inviteBanner: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    ...SHADOWS.fab,
  },
  inviteBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  inviteBannerIconWrap: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteBannerTitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  inviteBannerSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  gridSection: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.secondary,
    marginBottom: Spacing.md,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.xs,
    ...SHADOWS.card,
  },
  badgeCardLocked: {
    backgroundColor: Colors.surface.screen,
    opacity: 0.85,
  },
  badgeIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
    ...SHADOWS.fab,
  },
  badgeIconLocked: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    textAlign: "center",
    marginBottom: Spacing.xs / 2,
    minHeight: 36,
  },
  badgeNameLocked: {
    color: Colors.textScale.secondary,
  },
  unlockedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  unlockedTagText: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    color: "#059669",
  },
  lockedHintText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: Colors.textScale.muted,
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
    position: "relative",
    ...SHADOWS.modal,
  },
  modalCloseBtn: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
    zIndex: 10,
  },
  modalBadgeIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    ...SHADOWS.fab,
  },
  modalBadgeIconLocked: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalBadgeEmoji: {
    fontSize: 42,
  },
  modalBadgeName: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  modalBadgeTagline: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalBadgeDesc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.secondary,
    textAlign: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  modalStatsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface.screen,
    borderRadius: RADIUS.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    width: "100%",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: Colors.textScale.secondary,
  },
  modalStatValue: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    marginTop: 2,
  },
  modalShareBtn: {
    width: "100%",
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    ...SHADOWS.card,
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
  modalLockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#F3F4F6",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
  },
  modalLockedPillText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
});
