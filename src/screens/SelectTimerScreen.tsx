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
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserStats, recordShare } from "../services/badgeService";
import { UserStats } from "../model/Badge";
import { ExerciseLibraryView } from "../components/ExerciseLibraryView";
import { LegalDisclaimerModal } from "../components/LegalDisclaimerModal";
import { useAlert } from "../context/AlertContext";
import { t } from "../i18n";

const STORAGE_KEY = "@hiit_timers";
const INITIALIZED_KEY = "@hiit_initialized";
const LEGAL_ACCEPTED_KEY = "@legal_disclaimer_accepted";
const LEGAL_ACCEPTED_DATE_KEY = "@legal_disclaimer_accepted_date";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  const { showAlert } = useAlert();
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
  const [selectedTimerIds, setSelectedTimerIds] = useState<string[]>([]);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const isSelectionActive = !isReorderMode && selectedTimerIds.length > 0;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    if (isFocused) {
      loadTimers();
      getUserStats().then(setUserStats);
    }
  }, [isFocused]);

  async function loadTimers() {
    const isInitial = !hasLoadedRef.current;
    const startTime = Date.now();
    try {
      if (isInitial) {
        setLoading(true);
      }
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
      } else {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data) as Timer[];
          const normalized = parsed.map((t) => ({
            ...t,
            intervals: t.intervals.map((int, idx) => normalizeInterval(int, idx)),
          }));
          setTimers(normalized);
        }
      }
    } catch (e) {
      console.warn("Failed to load timers from AsyncStorage:", e);
    } finally {
      if (isInitial) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1500 - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        setLoading(false);
        hasLoadedRef.current = true;
      }
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

  function handleLongPressTimer(item: Timer) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedTimerIds.includes(item.id)) {
      setSelectedTimerIds((prev) => [...prev, item.id]);
    }
  }

  function toggleSelectTimer(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function exitSelectionMode() {
    setSelectedTimerIds([]);
    setIsReorderMode(false);
  }

  function handleShareSelected() {
    if (selectedTimerIds.length === 1) {
      const timerToShare = timers.find((t) => t.id === selectedTimerIds[0]);
      if (timerToShare) {
        handleShareTimer(timerToShare);
      }
    }
  }

  function handleDeleteSelected() {
    showAlert({
      title: t("selectTimer.deleteConfirmTitle"),
      message: t("selectTimer.deleteConfirmMessage"),
      icon: "trash",
      buttons: [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const remaining = timers.filter((t) => !selectedTimerIds.includes(t.id));
            setTimers(remaining);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
            exitSelectionMode();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    });
  }

  const renderTimerCard = ({ item, drag, isActive }: RenderItemParams<Timer>) => {
    const isSelected = isSelectionActive && selectedTimerIds.includes(item.id);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          testID={`timer-card-${item.id}`}
          style={[
            styles.card,
            isActive && styles.cardDragging,
            { marginBottom: Spacing.cardGap },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (isSelectionActive) {
              toggleSelectTimer(item.id);
            } else if (!isReorderMode) {
              navigation.navigate("CreateTimer", { timer: item });
            }
          }}
          onLongPress={() => {
            if (isReorderMode) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              drag();
            } else if (!isSelectionActive) {
              handleLongPressTimer(item);
            }
          }}
          delayLongPress={250}
        >
          {isSelected && (
            <View
              testID="card-selected-border"
              style={styles.cardSelectedBorder}
              pointerEvents="none"
            />
          )}

          <View style={styles.cardHeader}>
            {isSelectionActive && (
              <View style={styles.selectIndicator}>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={isSelected ? Colors.primary : Colors.textScale.muted}
                />
              </View>
            )}

            {isReorderMode && (
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
                  size={24}
                  color={isActive ? Colors.primary : Colors.textScale.muted}
                />
              </TouchableOpacity>
            )}

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

            {!isSelectionActive && !isReorderMode && (
              <TouchableOpacity
                testID={`btn-play-timer-${item.id}`}
                accessibilityLabel={t("common.play")}
                style={styles.cardPlayButton}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => navigation.navigate("Timer", { timer: item })}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

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

      {/* Header with Greeting & Contextual Selection Bar */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[
          styles.header,
          isScrolled && activeTab === "workouts" ? styles.headerScrolled : styles.headerUnscrolled,
          { paddingTop: Math.max(insets.top, 20) + Spacing.sm },
        ]}
      >
        {isSelectionActive || isReorderMode ? (
          <View style={styles.headerSelectionRow}>
            <TouchableOpacity
              testID="btn-close-selection"
              accessibilityLabel={t("common.cancel")}
              style={styles.headerIconButton}
              activeOpacity={0.6}
              onPress={exitSelectionMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color={Colors.textScale.primary} />
            </TouchableOpacity>

            <Text style={styles.selectionTitle} numberOfLines={1}>
              {isReorderMode
                ? t("selectTimer.reorderTitle")
                : t("selectTimer.selectedCount", { count: selectedTimerIds.length })}
            </Text>

            <View style={styles.selectionActionsRow}>
              {!isReorderMode && selectedTimerIds.length === 1 && (
                <TouchableOpacity
                  testID="btn-header-share"
                  accessibilityLabel={t("common.share")}
                  style={styles.headerIconButton}
                  activeOpacity={0.6}
                  onPress={handleShareSelected}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="share-social" size={22} color={Colors.textScale.primary} />
                </TouchableOpacity>
              )}

              {!isReorderMode && (
                <TouchableOpacity
                  testID="btn-header-reorder"
                  accessibilityLabel={t("selectTimer.reorderTitle")}
                  style={styles.headerIconButton}
                  activeOpacity={0.6}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTimerIds([]);
                    setIsReorderMode(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="swap-vert" size={26} color={Colors.textScale.primary} />
                </TouchableOpacity>
              )}

              {!isReorderMode && (
                <TouchableOpacity
                  testID="btn-header-delete"
                  accessibilityLabel={t("common.delete")}
                  style={styles.headerIconButton}
                  activeOpacity={0.6}
                  onPress={handleDeleteSelected}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash" size={22} color={Colors.destructive} />
                </TouchableOpacity>
              )}

              {isReorderMode && (
                <TouchableOpacity
                  testID="btn-header-done-reorder"
                  style={styles.doneReorderButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    exitSelectionMode();
                  }}
                >
                  <Text style={styles.doneReorderText}>{t("selectTimer.doneReorder")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
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
                testID="btn-achievements"
                accessibilityLabel={t("awards.title")}
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
        )}
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

          <View style={styles.generateFabShadow}>
            <TouchableOpacity
              testID="btn-generate-ai"
              accessibilityLabel={t("selectTimer.generateAi")}
              style={styles.generateFabTouchable}
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
    backgroundColor: Colors.surface.screen,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface.screen,
  },
  headerUnscrolled: {
    backgroundColor: Colors.surface.screen,
  },
  headerScrolled: {
    backgroundColor: Colors.surface.screen,
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
  headerSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: TOUCH_TARGET.icon,
  },
  headerCloseButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  selectionActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerIconButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  doneReorderButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 36,
  },
  doneReorderText: {
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  headerTitles: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize["3xl"],
    fontWeight: "800",
    color: Colors.textScale.primary,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: FontSize.sm,
    color: Colors.textScale.secondary,
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  trophyButton: {
    padding: Spacing.xs,
    borderRadius: RADIUS.full,
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
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    padding: Spacing.md,
    ...SHADOWS.card,
  },
  cardSelectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    zIndex: 1,
  },
  selectIndicator: {
    marginRight: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDragging: {
    backgroundColor: Colors.surface.screen,
    ...SHADOWS.floating,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dragHandle: {
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
    color: Colors.textScale.primary,
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
    backgroundColor: Colors.neutralAction.surface,
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
    color: Colors.textScale.secondary,
  },
  aiBadgeText: {
    color: "#059669",
    fontWeight: "700",
  },
  durationBadge: {
    backgroundColor: Colors.surface.tintActive,
  },
  durationBadgeText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  cardPlayButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
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
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.fab,
  },
  generateFabShadow: {
    width: TOUCH_TARGET.cta,
    height: TOUCH_TARGET.cta,
    borderRadius: RADIUS.full,
    ...SHADOWS.fab,
    backgroundColor: "transparent",
  },
  generateFabTouchable: {
    width: TOUCH_TARGET.cta,
    height: TOUCH_TARGET.cta,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  generateFabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingTabBar: {
    position: "absolute",
    left: Spacing.screen,
    right: Spacing.screen,
    flexDirection: "row",
    backgroundColor: Colors.surface.floatingNav,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: 4,
    ...SHADOWS.floating,
    zIndex: 15,
  },
  floatingTab: {
    flex: 1,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingTabActive: {
    backgroundColor: Colors.surface.tintActive,
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
    color: Colors.textScale.heading,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textScale.muted,
    textAlign: "center",
  },
});
