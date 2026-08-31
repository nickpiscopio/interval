import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { RootStackScreenProps } from "../types";
import { Timer } from "../model/Timer";
import { normalizeInterval } from "../model/Interval";
import { Exercise } from "../model/Exercise";
import { DEFAULT_AI_TIMERS } from "../constants/defaultTimers";
import { encodeBase64 } from "../utils/base64";
import Spacing, { RADIUS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserStats, recordShare } from "../services/badgeService";
import { UserStats } from "../model/Badge";
import { ExerciseLibraryView } from "../components/ExerciseLibraryView";
import { LegalDisclaimerModal } from "../components/LegalDisclaimerModal";
import { t } from "../i18n";

const STORAGE_KEY = "@hiit_timers";
const INITIALIZED_KEY = "@hiit_initialized";
const LEGAL_ACCEPTED_KEY = "@legal_disclaimer_accepted";
const LEGAL_ACCEPTED_DATE_KEY = "@legal_disclaimer_accepted_date";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  const [activeTab, setActiveTab] = useState<"workouts" | "library">("workouts");
  const [timers, setTimers] = useState<Timer[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);
  const [showLegalGate, setShowLegalGate] = useState(false);
  const [showLegalReview, setShowLegalReview] = useState(false);
  const [legalAcceptedDate, setLegalAcceptedDate] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isFocused) {
      loadTimers();
      getUserStats().then(setUserStats);
    }
  }, [isFocused]);

  async function loadTimers() {
    try {
      setLoading(true);
      const isLegalAccepted = await AsyncStorage.getItem(LEGAL_ACCEPTED_KEY);
      if (!isLegalAccepted) {
        setShowLegalGate(true);
      } else {
        const savedDate = await AsyncStorage.getItem(LEGAL_ACCEPTED_DATE_KEY);
        if (savedDate) {
          setLegalAcceptedDate(savedDate);
        }
      }

      const isInitialized = await AsyncStorage.getItem(INITIALIZED_KEY);
      if (!isInitialized) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AI_TIMERS));
        await AsyncStorage.setItem(INITIALIZED_KEY, "true");
        setTimers(DEFAULT_AI_TIMERS);
        return;
      }

      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Timer[];
        const normalized = parsed.map((t) => ({
          ...t,
          intervals: t.intervals.map((int, idx) => normalizeInterval(int, idx)),
        }));
        setTimers(normalized);
      }
    } catch (e) {
      console.warn("Failed to load timers from AsyncStorage:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptLegal() {
    try {
      const todayFormatted = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      await AsyncStorage.setItem(LEGAL_ACCEPTED_KEY, "true");
      await AsyncStorage.setItem(LEGAL_ACCEPTED_DATE_KEY, todayFormatted);
      setLegalAcceptedDate(todayFormatted);
    } catch (e) {
      console.warn("Failed to save legal acceptance:", e);
    } finally {
      setShowLegalGate(false);
    }
  }

  function calculateTotalDuration(timer: Timer): number {
    const intervalsDuration = timer.intervals.reduce(
      (sum, int) => sum + int.duration,
      0
    );
    return intervalsDuration * timer.rounds;
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      const minsStr = mins > 0 ? `${mins}m` : "";
      const secsStr = secs > 0 ? `${secs}s` : "";
      return [`${hours}h`, minsStr, secsStr].filter(Boolean).join(" ");
    }
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ""}`.trim();
    }
    return `${secs}s`;
  }

  async function handleShareTimer(timer: Timer) {
    try {
      const sharePayload = {
        name: timer.name,
        rounds: timer.rounds,
        intervals: timer.intervals.map((i) => ({
          id: i.id,
          name: i.name,
          duration: i.duration,
          color: i.color,
        })),
        isAiGenerated: timer.isAiGenerated,
      };

      const base64Str = encodeBase64(JSON.stringify(sharePayload));
      const shareUrl = `interval://import?t=${base64Str}`;
      const message = t("selectTimer.shareMessage", {
        name: timer.name,
        url: shareUrl,
        defaultValue: `Check out my HIIT workout "${timer.name}" on Interval Timer! \n\n${shareUrl}`,
      });

      const result = await Share.share({
        title: timer.name,
        message,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        await recordShare(result.activityType);
      }
    } catch (e) {
      console.warn("Failed to share timer:", e);
    }
  }

  function handleStartQuickRoutine(exercise: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const quickTimer: Timer = {
      id: `quick_${Date.now()}`,
      name: exercise.name,
      rounds: 3,
      intervals: [
        {
          id: "prep",
          name: t("timer.prep", { defaultValue: "Get Ready" }),
          duration: 10,
          color: "#6B7280",
        },
        {
          id: "work",
          name: exercise.name,
          duration: 40,
          color: exercise.category === "corrective" ? "#059669" : "#3B82F6",
          exerciseId: exercise.id,
        },
        {
          id: "rest",
          name: t("timer.rest", { defaultValue: "Rest" }),
          duration: 15,
          color: "#4B5563",
        },
      ],
      createdAt: Date.now(),
    };
    navigation.navigate("Timer", { timer: quickTimer });
  }

  function handleCreateCustomTimer(exercise: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const customTimer: Timer = {
      id: `custom_${Date.now()}`,
      name: `${exercise.name} Routine`,
      rounds: 3,
      intervals: [
        {
          id: "work_1",
          name: exercise.name,
          duration: 30,
          color: exercise.category === "corrective" ? "#059669" : "#3B82F6",
          exerciseId: exercise.id,
        },
        {
          id: "rest_1",
          name: t("timer.rest", { defaultValue: "Rest" }),
          duration: 15,
          color: "#4B5563",
        },
      ],
      createdAt: Date.now(),
    };
    navigation.navigate("CreateTimer", { timer: customTimer });
  }

  const renderTimerCard = ({ item, drag, isActive }: RenderItemParams<Timer>) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[
          styles.card,
          isActive && styles.cardDragging,
          { marginBottom: Spacing.cardGap },
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("CreateTimer", { timer: item })}
      >
        <View style={styles.cardHeader}>
          <TouchableOpacity
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              drag();
            }}
            style={styles.dragHandle}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <MaterialIcons
              name="drag-indicator"
              size={22}
              color={isActive ? Colors.primary : Colors.textScale.muted}
            />
          </TouchableOpacity>

          <View style={styles.cardMetaContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.badgeRow}>
              {item.isAiGenerated && (
                <View style={[styles.badge, styles.aiBadge]}>
                  <Ionicons name="sparkles" size={12} color="#059669" />
                  <Text style={[styles.badgeText, styles.aiBadgeText]}>AI</Text>
                </View>
              )}
              <View style={styles.badge}>
                <Ionicons name="repeat" size={12} color="#4B5563" />
                <Text style={styles.badgeText}>{item.rounds} {t("common.rounds")}</Text>
              </View>
              <View style={[styles.badge, styles.durationBadge]}>
                <Ionicons name="time-outline" size={12} color="#1D4ED8" />
                <Text style={[styles.badgeText, styles.durationBadgeText]}>
                  {formatTime(calculateTotalDuration(item))}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.cardShareButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleShareTimer(item)}
            >
              <Ionicons name="share-outline" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardPlayButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate("Timer", { timer: item })}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  const bottomDockOffset = Math.max(insets.bottom, 12) + 64;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {activeTab === "workouts" ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : timers.length === 0 ? (
          <View style={[styles.emptyContainer, { paddingTop: headerHeight + Spacing.lg }]}>
            <Ionicons name="timer-outline" size={64} color={Colors.textScale.muted} />
            <Text style={styles.emptyTitle}>{t("selectTimer.emptyTitle")}</Text>
            <Text style={styles.emptySubtitle}>{t("selectTimer.emptySubtitle")}</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={timers}
            keyExtractor={(item) => item.id}
            onDragBegin={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onDragEnd={({ data }) => {
              setTimers(data);
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }}
            renderItem={renderTimerCard}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: headerHeight + Spacing.sm,
                paddingBottom: bottomDockOffset + 80,
              },
            ]}
            onScrollOffsetChange={(offsetY) => {
              setIsScrolled(offsetY > 1);
            }}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const offsetY = contentOffset.y;
              setIsScrolled(offsetY > 0);
              const remaining = contentSize.height - (offsetY + layoutMeasurement.height);
              setHasMoreBelow(remaining > 10);
            }}
            onContentSizeChange={(_, contentHeight) => {
              setHasMoreBelow(contentHeight > 550);
            }}
            scrollEventThrottle={16}
          />
        )
      ) : (
        <View style={{ flex: 1, paddingTop: headerHeight + Spacing.xs }}>
          <ExerciseLibraryView
            onStartQuickRoutine={handleStartQuickRoutine}
            onCreateCustomTimer={handleCreateCustomTimer}
            bottomPadding={bottomDockOffset + 20}
          />
        </View>
      )}

      {/* Header with Greeting & Trophy Room */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[
          styles.header,
          isScrolled && activeTab === "workouts" ? styles.headerScrolled : styles.headerUnscrolled,
          { paddingTop: Math.max(insets.top, 20) + Spacing.sm },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>
              {activeTab === "workouts"
                ? t("selectTimer.greeting")
                : t("exercises.libraryTitle")}
            </Text>
            <Text style={styles.subGreeting}>
              {activeTab === "workouts"
                ? t("selectTimer.subGreeting")
                : t("exercises.librarySubtitle")}
            </Text>
          </View>
          <View style={styles.headerActionsRow}>
            <TouchableOpacity
              testID="legal-info-header-btn"
              style={styles.infoButton}
              activeOpacity={0.8}
              onPress={() => setShowLegalReview(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={22} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trophyButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Awards")}
            >
              {userStats && userStats.currentStreak > 0 ? (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeEmoji}>🔥</Text>
                  <Text style={styles.streakBadgeCount}>{userStats.currentStreak}</Text>
                </View>
              ) : (
                <View style={styles.trophyIconWrap}>
                  <Ionicons name="trophy" size={22} color="#F59E0B" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isScrolled && activeTab === "workouts" && (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.05)", "transparent"]}
          style={[
            styles.headerShadowGradient,
            { top: headerHeight },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Floating Action Buttons (Workouts Tab Only) */}
      {activeTab === "workouts" && (
        <View
          style={[
            styles.fabContainer,
            {
              bottom: Math.max(insets.bottom, 12) + 60,
            },
          ]}
        >
          <TouchableOpacity
            testID="btn-create-custom"
            accessibilityLabel={t("selectTimer.createCustom")}
            style={styles.createFab}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("CreateTimer");
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-generate-ai"
            accessibilityLabel={t("selectTimer.generateAi")}
            style={styles.generateFabWrapper}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("GenerateTimer");
            }}
          >
            <LinearGradient
              colors={["#1A6CCC", "#1ACC6C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateFabGradient}
            >
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Translucent Tab Bar */}
      <View
        style={[
          styles.floatingTabBar,
          {
            bottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          testID="tab-workouts"
          accessibilityLabel={t("selectTimer.workoutsTab")}
          style={[
            styles.floatingTab,
            activeTab === "workouts" && styles.floatingTabActive,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("workouts");
          }}
        >
          <Ionicons
            name={activeTab === "workouts" ? "timer" : "timer-outline"}
            size={24}
            color={activeTab === "workouts" ? Colors.primary : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-library"
          accessibilityLabel={t("selectTimer.libraryTab")}
          style={[
            styles.floatingTab,
            activeTab === "library" && styles.floatingTabActive,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("library");
          }}
        >
          <Ionicons
            name={activeTab === "library" ? "barbell" : "barbell-outline"}
            size={24}
            color={activeTab === "library" ? Colors.primary : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {/* First-Launch Blocking Legal Gate Modal */}
      <LegalDisclaimerModal
        visible={showLegalGate}
        mode="gate"
        onAccept={handleAcceptLegal}
      />

      {/* Reviewable Legal & Medical Info Modal */}
      <LegalDisclaimerModal
        visible={showLegalReview}
        mode="review"
        acceptedDate={legalAcceptedDate}
        onClose={() => setShowLegalReview(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.md,
  },
  headerUnscrolled: {
    backgroundColor: "#F9FAFB",
  },
  headerScrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  headerShadowGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    zIndex: 9,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitles: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize["3xl"],
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: FontSize.sm,
    color: "#6B7280",
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trophyButton: {
    padding: Spacing.xs,
    borderRadius: RADIUS.full,
  },
  trophyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  streakBadgeEmoji: {
    fontSize: 16,
  },
  streakBadgeCount: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: "#B45309",
  },
  listContent: {
    paddingHorizontal: Spacing.screen,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.md,
    paddingLeft: 0,
    padding: Spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 0,
    borderColor: "#F3F4F6",
  },
  cardDragging: {
    backgroundColor: "#F9FAFB",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dragHandle: {
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: "center",
  },
  cardMetaContainer: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  cardTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  aiBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  aiBadgeText: {
    color: "#059669",
    fontWeight: "700",
  },
  durationBadge: {
    backgroundColor: "#EFF6FF",
  },
  durationBadgeText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardShareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  intervalPill: {
    height: "100%",
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.screen,
    alignItems: "center",
    gap: Spacing.sm,
    zIndex: 20,
  },
  createFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  generateFabWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  generateFabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingTabBar: {
    position: "absolute",
    left: Spacing.screen,
    right: Spacing.screen,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 15,
  },
  floatingTab: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingTabActive: {
    backgroundColor: "#EFF6FF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: "#374151",
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
