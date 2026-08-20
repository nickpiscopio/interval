import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { RootStackScreenProps } from "../types";
import { Timer } from "../model/Timer";
import { Interval } from "../model/Interval";

const STORAGE_KEY = "@hiit_timers";
const COLOR_PALETTE = [
  "#1ACC6C", // Green
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8338EC", // Purple
  "#E63946", // Red
  "#F95738", // Orange
  "#F9C74F"  // Yellow
];

export default function CreateTimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"CreateTimer">) {
  const editTimer = route.params?.timer;
  const isImportMode = editTimer && editTimer.id.startsWith("ai_") && !editTimer.createdAt;

  // Form State
  const [timerName, setTimerName] = useState("");
  const [rounds, setRounds] = useState(3);
  const [intervals, setIntervals] = useState<Interval[]>([
    { name: "High Interval", duration: 30, color: "#1ACC6C" },
    { name: "Low Interval", duration: 15, color: "#3B82F6" }
  ]);
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number>(0);

  // Initialize form if in edit/import mode
  useEffect(() => {
    if (editTimer) {
      setTimerName(editTimer.name);
      setRounds(editTimer.rounds);
      setIntervals(
        editTimer.intervals.map((int) => ({
          name: int.name,
          duration: int.duration,
          color: int.color,
          exerciseId: int.exerciseId
        }))
      );
      setSelectedIntervalIndex(0);
    } else {
      setTimerName("My HIIT Timer");
      setRounds(3);
    }
  }, [editTimer]);

  const selectedInterval = intervals[selectedIntervalIndex];

  // Action: Add Interval
  function addInterval() {
    const newInterval: Interval = {
      name: "Work Interval",
      duration: 30,
      color: COLOR_PALETTE[intervals.length % COLOR_PALETTE.length]
    };
    setIntervals([...intervals, newInterval]);
    setSelectedIntervalIndex(intervals.length);
  }

  // Action: Update Selected Interval Properties
  function updateSelectedInterval(fields: Partial<Interval>) {
    if (selectedIntervalIndex === -1) return;
    const updated = [...intervals];
    updated[selectedIntervalIndex] = {
      ...updated[selectedIntervalIndex],
      ...fields
    };
    setIntervals(updated);
  }

  // Action: Duplicate Interval
  function duplicateSelectedInterval() {
    if (selectedIntervalIndex === -1) return;
    const current = intervals[selectedIntervalIndex];
    const duplicated: Interval = {
      name: `${current.name} (Copy)`,
      duration: current.duration,
      color: current.color,
      exerciseId: current.exerciseId
    };
    const updated = [...intervals];
    updated.splice(selectedIntervalIndex + 1, 0, duplicated);
    setIntervals(updated);
    setSelectedIntervalIndex(selectedIntervalIndex + 1);
  }

  // Action: Delete Selected Interval
  function deleteSelectedInterval() {
    if (intervals.length <= 1) {
      Alert.alert("Error", "You must have at least one interval in your timer.");
      return;
    }
    const updated = intervals.filter((_, idx) => idx !== selectedIntervalIndex);
    setIntervals(updated);
    setSelectedIntervalIndex(Math.max(0, selectedIntervalIndex - 1));
  }

  // Save Timer to local database
  async function saveTimer() {
    if (!timerName.trim()) {
      Alert.alert("Error", "Please enter a workout name.");
      return;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let savedTimers: Timer[] = data ? JSON.parse(data) : [];

      const timerToSave: Timer = {
        id: editTimer?.id || `timer_${Date.now()}`,
        name: timerName.trim(),
        rounds,
        intervals,
        createdAt: editTimer?.createdAt || Date.now()
      };

      if (editTimer) {
        // Update existing timer
        savedTimers = savedTimers.map((t) => (t.id === timerToSave.id ? timerToSave : t));
        // If it was a shared timer we are importing, it might not exist yet:
        if (!savedTimers.some((t) => t.id === timerToSave.id)) {
          savedTimers.push(timerToSave);
        }
      } else {
        // Add new timer
        savedTimers.push(timerToSave);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedTimers));
      Alert.alert("Success", "Timer saved successfully!", [
        { text: "OK", onPress: () => navigation.popToTop() }
      ]);
    } catch (e) {
      console.warn("Failed to save timer:", e);
      Alert.alert("Error", "Failed to save timer. Please try again.");
    }
  }

  // Delete entire Timer
  async function deleteTimer() {
    if (!editTimer) return;
    
    Alert.alert(
      "Delete Timer?",
      "Are you sure you want to delete this entire workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem(STORAGE_KEY);
              if (data) {
                const parsed = JSON.parse(data) as Timer[];
                const filtered = parsed.filter((t) => t.id !== editTimer.id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              }
              navigation.popToTop();
            } catch (e) {
              console.warn("Failed to delete timer:", e);
            }
          }
        }
      ]
    );
  }

  // Parse seconds into minutes & seconds for display
  function formatSeconds(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Change duration helpers
  function adjustDuration(amount: number) {
    if (!selectedInterval) return;
    const newDuration = Math.max(5, selectedInterval.duration + amount);
    updateSelectedInterval({ duration: newDuration });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      {/* Header Banner */}
      {isImportMode && (
        <View style={styles.importBanner}>
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.importBannerText}>Review & Import Shared Workout</Text>
        </View>
      )}

      {/* Interval List Scroll Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Timer Config Section */}
        <View style={styles.configCard}>
          <Text style={styles.sectionTitle}>Workout Details</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Workout Name</Text>
              <TextInput
                style={styles.textInput}
                value={timerName}
                onChangeText={setTimerName}
                placeholder="My HIIT Workout"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 0.4 }]}>
              <Text style={styles.inputLabel}>Rounds</Text>
              <View style={styles.roundsControl}>
                <TouchableOpacity
                  onPress={() => setRounds(Math.max(1, rounds - 1))}
                  style={styles.roundAdjustButton}
                >
                  <Ionicons name="remove" size={16} color="#4B5563" />
                </TouchableOpacity>
                <Text style={styles.roundsValue}>{rounds}</Text>
                <TouchableOpacity
                  onPress={() => setRounds(rounds + 1)}
                  style={styles.roundAdjustButton}
                >
                  <Ionicons name="add" size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.intervalListHeader}>
          <Text style={styles.sectionTitle}>Interval Sequence</Text>
          <TouchableOpacity style={styles.addIntervalLink} onPress={addInterval}>
            <Ionicons name="add-circle" size={18} color="#3B82F6" />
            <Text style={styles.addIntervalLinkText}>Add Interval</Text>
          </TouchableOpacity>
        </View>

        {/* Intervals Display */}
        {intervals.map((int, idx) => {
          const isSelected = idx === selectedIntervalIndex;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.9}
              onPress={() => setSelectedIntervalIndex(idx)}
              style={[
                styles.intervalItem,
                isSelected && styles.intervalItemActive,
                { borderLeftColor: int.color }
              ]}
            >
              <View style={styles.intervalInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: int.color }]} />
                <Text style={styles.intervalName}>{int.name}</Text>
              </View>
              <Text style={styles.intervalDuration}>{formatSeconds(int.duration)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Editor Panel at bottom for focused interval */}
      {selectedInterval && (
        <View style={styles.editorPanel}>
          <Text style={styles.editorTitle}>Edit Selected Interval</Text>
          
          <View style={styles.editorInputRow}>
            {/* Interval Name */}
            <TextInput
              style={styles.editorTextInput}
              value={selectedInterval.name}
              onChangeText={(name) => updateSelectedInterval({ name })}
              placeholder="Interval Name"
            />
            {/* Duration Adjuster */}
            <View style={styles.durationAdjuster}>
              <TouchableOpacity onPress={() => adjustDuration(-5)} style={styles.adjustBtn}>
                <Text style={styles.adjustBtnText}>-5s</Text>
              </TouchableOpacity>
              <Text style={styles.durationDisplay}>{formatSeconds(selectedInterval.duration)}</Text>
              <TouchableOpacity onPress={() => adjustDuration(5)} style={styles.adjustBtn}>
                <Text style={styles.adjustBtnText}>+5s</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Color Picker */}
          <Text style={styles.label}>Interval Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
            {COLOR_PALETTE.map((color) => {
              const isSelected = selectedInterval.color === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => updateSelectedInterval({ color })}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    isSelected && styles.colorOptionSelected
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Editor Action Buttons */}
          <View style={styles.editorActions}>
            <TouchableOpacity onPress={deleteSelectedInterval} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={20} color="#E63946" />
              <Text style={[styles.actionBtnText, { color: "#E63946" }]}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={duplicateSelectedInterval} style={styles.actionBtn}>
              <Ionicons name="copy-outline" size={20} color="#4B5563" />
              <Text style={styles.actionBtnText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const mappedIntervals = intervals.map(int => ({
                  ...int,
                  durationLeftInMillis: int.duration * 1000,
                  totalDuration: int.duration * 1000
                }));
                navigation.navigate("Timer", {
                  timer: {
                    id: editTimer?.id || "temp",
                    name: timerName,
                    rounds: rounds,
                    intervals: mappedIntervals,
                    createdAt: Date.now()
                  }
                });
              }}
              style={[styles.actionBtn, styles.startBtn]}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Global Actions footer */}
      <View style={styles.footer}>
        {editTimer && !isImportMode && (
          <TouchableOpacity onPress={deleteTimer} style={styles.deleteWorkoutBtn}>
            <Ionicons name="trash-bin" size={20} color="#E63946" />
            <Text style={styles.deleteWorkoutBtnText}>Delete Workout</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={saveTimer} style={styles.saveWorkoutBtn}>
          <Text style={styles.saveWorkoutBtnText}>
            {isImportMode ? "Import Workout" : "Save Workout"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  importBanner: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  importBannerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 260, // Leave space for the sticky editor panel
  },
  configCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  roundsControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    height: 44,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  roundAdjustButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  roundsValue: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    paddingHorizontal: 8,
  },
  intervalListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addIntervalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addIntervalLinkText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#3B82F6",
  },
  intervalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 5,
  },
  intervalItemActive: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  intervalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  intervalName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#374151",
  },
  intervalDuration: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  editorPanel: {
    position: "absolute",
    bottom: 72, // Above the global save footer
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  editorTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 8,
  },
  editorInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  editorTextInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
  },
  durationAdjuster: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
  },
  adjustBtn: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  adjustBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#4B5563",
  },
  durationDisplay: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: 6,
  },
  colorPalette: {
    flexDirection: "row",
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#4B5563",
  },
  startBtn: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  deleteWorkoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E63946",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  deleteWorkoutBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#E63946",
  },
  saveWorkoutBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  saveWorkoutBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
});
