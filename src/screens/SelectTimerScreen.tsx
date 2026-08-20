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

const STORAGE_KEY = "@hiit_timers";

export default function SelectTimerScreen({
  navigation,
}: RootStackScreenProps<"Root">) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadTimers();
    }
  }, [isFocused]);

  async function loadTimers() {
    try {
      setLoading(true);
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
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Let's Workout! ⚡️</Text>
        <Text style={styles.subGreeting}>Choose or generate a HIIT timer to start</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : timers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="stopwatch-outline" size={72} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Timers Yet</Text>
          <Text style={styles.emptyText}>
            Build your custom intervals or let the AI coach design a workout for you.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
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
      <View style={styles.buttonPanel}>
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
            colors={["#10B981", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Make room for floating bottom panel
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  },
  cardMetaContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
  },
  durationBadge: {
    backgroundColor: "#EFF6FF",
  },
  durationBadgeText: {
    color: "#1D4ED8",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  createButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#3B82F6",
  },
  generateButton: {
    flex: 1.2,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginRight: 6,
  },
});
