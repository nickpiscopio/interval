import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackScreenProps } from "../types";
import { Timer } from "../model/Timer";
import { DEFAULT_AI_TIMERS } from "../constants/defaultTimers";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORAGE_KEY = "@hiit_timers";
const INITIALIZED_KEY = "@hiit_initialized";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isFocused) {
      loadTimers();
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
        // Sort by creation date descending
        parsed.sort((a, b) => b.createdAt - a.createdAt);
        setTimers(parsed);
      } else {
        setTimers([]);
      }
    } catch (e) {
      console.warn("Failed to load timers:", e);
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

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
    }
    return `${secs}s`;
  }

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
        <Text style={styles.greeting}>Let's Workout! ⚡️</Text>
        <Text style={styles.subGreeting}>Choose or generate a HIIT timer to start</Text>

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
        <ScrollView
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
        >
          {timers.map((timer) => (
            <TouchableOpacity
              key={timer.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("CreateTimer", { timer })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardMetaContainer}>
                  <Text style={styles.cardTitle}>{timer.name}</Text>
                  <View style={styles.badgeRow}>
                    {timer.isAiGenerated && (
                      <View style={[styles.badge, styles.aiBadge]}>
                        <Ionicons name="sparkles" size={12} color="#059669" />
                        <Text style={[styles.badgeText, styles.aiBadgeText]}>AI</Text>
                      </View>
                    )}
                    <View style={styles.badge}>
                      <Ionicons name="repeat" size={12} color="#4B5563" />
                      <Text style={styles.badgeText}>{timer.rounds} Rounds</Text>
                    </View>
                    <View style={[styles.badge, styles.durationBadge]}>
                      <Ionicons name="time-outline" size={12} color="#1D4ED8" />
                      <Text style={[styles.badgeText, styles.durationBadgeText]}>
                        {formatTime(calculateTotalDuration(timer))}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Timer", { timer })}
                >
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardMetaContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: Spacing.radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
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
    borderWidth: 1,
    borderColor: "#A7F3D0",
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
  },
  playButton: {
    width: Spacing.touchTarget.min,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.touchTarget.min / 2,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["5xl"],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.lineHeight.xl,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  buttonPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  createButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#3B82F6",
    textAlign: "center",
  },
  generateButton: {
    flex: 1.2,
    minHeight: Spacing.touchTarget.cta,
    borderRadius: Spacing.radius.md,
    overflow: "hidden",
  },
  gradientButton: {
    width: "100%",
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
});

