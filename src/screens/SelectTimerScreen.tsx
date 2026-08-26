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
import { DEFAULT_AI_TIMERS } from "../constants/defaultTimers";
import { encodeBase64 } from "../utils/base64";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserStats, recordShare } from "../services/badgeService";
import { UserStats } from "../model/Badge";

const STORAGE_KEY = "@hiit_timers";
const INITIALIZED_KEY = "@hiit_initialized";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);
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
      const isInitialized = await AsyncStorage.getItem(INITIALIZED_KEY);
      if (!isInitialized) {
        // Initial app launch: seed default AI timers
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AI_TIMERS));
        await AsyncStorage.setItem(INITIALIZED_KEY, "true");
        setTimers([...DEFAULT_AI_TIMERS].sort((a, b) => b.createdAt - a.createdAt));
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

  function calculateTotalDuration(timer: Timer): number {
    const intervalsDuration = timer.intervals.reduce(
      (sum, int) => sum + int.duration,
      0
    );
    return intervalsDuration * timer.rounds;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
    }
    return `${secs}s`;
  }

  async function handleShareTimer(timer: Timer) {
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
      
      const appStoreLink = "https://apps.apple.com/app/interval-hiit-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.plyonest.interval";

      const totalSec = calculateTotalDuration(timer);
      const shareMessage = `🔥 Try my custom HIIT workout "${timer.name}" on Interval!\n\nWorkout details: ${timer.rounds} rounds, ${formatTime(totalSec)} total time.\n\n1. Download Interval:\nApp Store: ${appStoreLink}\nPlay Store: ${playStoreLink}\n\n2. Open this link to load the timer:\n${deepLink}`;

      const result = await Share.share({
        message: shareMessage,
        title: `Share Timer: ${timer.name}`,
      });

      if (result.action === Share.sharedAction) {
        const { stats } = await recordShare(result.activityType);
        setUserStats(stats);
      }
    } catch (e) {
      console.warn("Failed to share timer:", e);
    }
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
          {/* Drag Handle on the Far Left inside the Card */}
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
                <Text style={styles.badgeText}>{item.rounds} Rounds</Text>
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
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Timer", { timer: item })}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Dynamic Sticky Header */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[
          styles.header,
          isScrolled ? styles.headerScrolled : styles.headerUnscrolled,
          { paddingTop: Math.max(insets.top, 20) + Spacing.sm },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>Let's Workout! ⚡️</Text>
            <Text style={styles.subGreeting}>Choose or generate a HIIT timer to start</Text>
          </View>
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

        {isScrolled && (
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.06)", "transparent"]}
            style={styles.headerShadowGradient}
            pointerEvents="none"
          />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : timers.length === 0 ? (
        <View style={[styles.emptyContainer, { paddingTop: headerHeight + Spacing.md }]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="stopwatch-outline" size={72} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Timers Yet</Text>
          <Text style={styles.emptyText}>
            Build your custom intervals or let the AI coach design a workout for you.
          </Text>
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
            { paddingTop: headerHeight + Spacing.sm },
          ]}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const offsetY = contentOffset.y;
            setIsScrolled(offsetY > 2);
            const remaining = contentSize.height - (offsetY + layoutMeasurement.height);
            setHasMoreBelow(remaining > 10);
          }}
          onContentSizeChange={(_, contentHeight) => {
            setHasMoreBelow(contentHeight > 550);
          }}
          scrollEventThrottle={16}
        />
      )}

      {/* Persistent Bottom Action Panel */}
      <View
        style={[
          styles.buttonPanel,
          {
            borderTopColor: hasMoreBelow ? "#E5E7EB" : "transparent",
            paddingBottom: Math.max(insets.bottom, 12) + Spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("CreateTimer")}
        >
          <Ionicons name="add" size={20} color="#3B82F6" style={styles.buttonIcon} />
          <Text style={styles.createButtonText}>Create Custom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.generateButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("GenerateTimer")}
        >
          <LinearGradient
            colors={Colors.aiGradient}
            start={Colors.aiGradientCoordinates.start}
            end={Colors.aiGradientCoordinates.end}
            style={styles.gradientButton}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.generateButtonText}>Generate with AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  headerUnscrolled: {
    backgroundColor: "#F9FAFB",
  },
  headerScrolled: {
    backgroundColor: "#FFFFFF",
  },
  headerShadowGradient: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    height: 5,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitles: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  trophyButton: {
    minHeight: Spacing.touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  trophyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: Spacing.radius.md,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 4,
  },
  streakBadgeEmoji: {
    fontSize: 16,
  },
  streakBadgeCount: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
  },
  greeting: {
    fontSize: FontSize["2xl"],
    lineHeight: FontSize.lineHeight["2xl"],
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  subGreeting: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginTop: Spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing["4xl"] * 2, // Make room for floating bottom panel
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardDragging: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dragHandle: {
    paddingRight: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  cardMetaContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
  },
  aiBadge: {
    backgroundColor: "#ECFDF5",
  },
  aiBadgeText: {
    color: "#059669",
    fontFamily: "Poppins-Bold",
  },
  durationBadge: {
    backgroundColor: "#EFF6FF",
  },
  durationBadgeText: {
    color: "#1D4ED8",
    fontFamily: "Poppins-Bold",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardShareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: Spacing.touchTarget.min,
    height: Spacing.touchTarget.min,
    borderRadius: Spacing.touchTarget.min / 2,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.md,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    minHeight: Spacing.button.minHeight,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  createButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#374151",
  },
  generateButton: {
    flex: 1.2,
    minHeight: Spacing.button.minHeight,
    borderRadius: Spacing.radius.sm,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  generateButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.lineHeight.xl,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 280,
  },
});
