import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { RootStackScreenProps } from "../types";
import { Timer } from "../model/Timer";
import { Interval, generateIntervalId, normalizeInterval } from "../model/Interval";
import { Exercise } from "../model/Exercise";
import { ExercisePickerModal } from "../components/ExercisePickerModal";
import { EditIntervalModal } from "../components/EditIntervalModal";
import { t } from "../i18n";
import { useAlert } from "../context/AlertContext";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

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

function formatSeconds(totalSec: number): string {
  const safeSec = Math.max(0, Math.floor(isNaN(totalSec) ? 0 : totalSec));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  if (hrs > 0) {
    if (mins === 0 && secs === 0) return `${hrs}h`;
    if (secs === 0) return `${hrs}h ${mins}m`;
    if (mins === 0) return `${hrs}h ${secs}s`;
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export default function CreateTimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"CreateTimer">) {
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const listRef = useRef<any>(null);

  const editTimer = route.params?.timer;
  const isImportMode = Boolean(editTimer && editTimer.id.startsWith("ai_") && !editTimer.createdAt);

  // Form State
  const [timerName, setTimerName] = useState("");
  const [rounds, setRounds] = useState(3);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [intervals, setIntervals] = useState<Interval[]>([
    { id: "init_1", name: "High Interval", duration: 30, color: "#1ACC6C" },
    { id: "init_2", name: "Low Interval", duration: 15, color: "#3B82F6" }
  ]);
  const [editingInterval, setEditingInterval] = useState<Interval | null>(null);
  const [showEditIntervalModal, setShowEditIntervalModal] = useState<boolean>(false);
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);

  // Initialize form if in edit/import mode
  useEffect(() => {
    if (editTimer) {
      setTimerName(editTimer.name);
      setRounds(editTimer.rounds);
      setIsAiGenerated(Boolean(editTimer.isAiGenerated || editTimer.id?.startsWith("ai_")));
      const normalized = editTimer.intervals.map((int, idx) => normalizeInterval(int, idx));
      setIntervals(normalized);
    } else {
      setTimerName("");
      setRounds(3);
      setIsAiGenerated(false);
      const initial: Interval[] = [
        { id: generateIntervalId(), name: "High Interval", duration: 30, color: "#1ACC6C" },
        { id: generateIntervalId(), name: "Low Interval", duration: 15, color: "#3B82F6" }
      ];
      setIntervals(initial);
    }
  }, [editTimer]);

  const isSaved = Boolean(editTimer && editTimer.createdAt && !isImportMode);
  const fallbackTitle = isSaved ? t("createTimer.titleEdit") : t("createTimer.titleCreate");
  const headerTitle = timerName.trim().length > 0 ? timerName.trim() : fallbackTitle;

  // Action: Open Edit Modal for Interval
  function handleSelectInterval(interval: Interval) {
    setEditingInterval(interval);
    setShowEditIntervalModal(true);
  }

  // Action: Add Interval and immediately open Edit Modal
  function addInterval() {
    const newInterval: Interval = {
      id: generateIntervalId(),
      name: t("createTimer.addInterval"),
      duration: 30,
      color: COLOR_PALETTE[intervals.length % COLOR_PALETTE.length]
    };
    const newIntervals = [...intervals, newInterval];
    setIntervals(newIntervals);
    setEditingInterval(newInterval);
    setShowEditIntervalModal(true);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }

  // Action: Update Interval Properties
  function updateInterval(fields: Partial<Interval>) {
    if (!editingInterval) return;
    const updatedInterval = { ...editingInterval, ...fields };
    setEditingInterval(updatedInterval);
    setIntervals((prev) =>
      prev.map((int) => (int.id === editingInterval.id ? updatedInterval : int))
    );
  }

  // Action: Pick Exercise from Library
  function handlePickExercise(exercise: Exercise) {
    const categoryColors: Record<string, string> = {
      cardio: "#1ACC6C",
      upper: "#3B82F6",
      lower: "#F59E0B",
      abs: "#8338EC",
      total: "#E63946",
    };
    updateInterval({
      name: exercise.name,
      exerciseId: exercise.id,
      color: categoryColors[exercise.category] || editingInterval?.color || "#1ACC6C",
    });
  }

  // Action: Duplicate Interval
  function duplicateSelectedInterval() {
    if (!editingInterval) return;
    const index = intervals.findIndex((int) => int.id === editingInterval.id);
    if (index === -1) return;
    const duplicated: Interval = {
      id: generateIntervalId(),
      name: `${editingInterval.name} ${t("createTimer.copySuffix")}`,
      duration: editingInterval.duration,
      color: editingInterval.color,
      exerciseId: editingInterval.exerciseId
    };
    const updated = [...intervals];
    updated.splice(index + 1, 0, duplicated);
    setIntervals(updated);
    setEditingInterval(duplicated);
    setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      } catch {
        listRef.current?.scrollToEnd({ animated: true });
      }
    }, 50);
  }

  // Action: Delete Selected Interval
  function deleteSelectedInterval() {
    if (intervals.length <= 1) {
      showAlert({
        title: t("common.appName"),
        message: t("createTimer.validationIntervalRequired"),
        icon: "warning",
        buttons: [{ text: t("common.ok"), style: "default" }],
      });
      return;
    }
    if (!editingInterval) return;
    const updated = intervals.filter((int) => int.id !== editingInterval.id);
    setIntervals(updated);
    setShowEditIntervalModal(false);
    setEditingInterval(null);
  }

  // Save Timer to local database
  async function saveTimer() {
    if (!timerName.trim()) {
      showAlert({
        title: t("common.appName"),
        message: t("createTimer.validationNameRequired"),
        icon: "error",
        buttons: [{ text: t("common.ok"), style: "default" }],
      });
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
        createdAt: editTimer?.createdAt || Date.now(),
        isAiGenerated: isAiGenerated ? true : undefined,
      };

      const existingIndex = savedTimers.findIndex((t) => t.id === timerToSave.id);
      if (existingIndex >= 0) {
        // Update existing timer
        savedTimers[existingIndex] = timerToSave;
      } else {
        // Create new timer
        savedTimers.push(timerToSave);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedTimers));
      navigation.popToTop();
    } catch (e) {
      console.error(e);
      showAlert({
        title: t("common.appName"),
        message: t("createTimer.saveError"),
        icon: "error",
        buttons: [{ text: t("common.ok"), style: "default" }],
      });
    }
  }

  // Start workout directly without saving
  function startTimer() {
    if (!timerName.trim()) {
      showAlert({
        title: t("common.appName"),
        message: t("createTimer.validationNameRequired"),
        icon: "error",
        buttons: [{ text: t("common.ok"), style: "default" }],
      });
      return;
    }

    const unsavedTimer: Timer = {
      id: editTimer?.id || "temp_timer",
      name: timerName.trim(),
      rounds,
      intervals,
      createdAt: editTimer?.createdAt || Date.now(),
      isAiGenerated: isAiGenerated ? true : undefined,
    };

    navigation.navigate("Timer", { timer: unsavedTimer });
  }

  // Delete entire timer
  function deleteTimer() {
    showAlert({
      title: t("createTimer.deleteConfirmTitle"),
      message: t("createTimer.deleteConfirmMessage", { name: timerName || t("createTimer.titleCreate") }),
      icon: "warning",
      buttons: [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            if (!editTimer) return;
            try {
              const data = await AsyncStorage.getItem(STORAGE_KEY);
              if (data) {
                const savedTimers: Timer[] = JSON.parse(data);
                const filtered = savedTimers.filter((t) => t.id !== editTimer.id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              }
              navigation.popToTop();
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    });
  }

  const renderIntervalItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Interval>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectInterval(item)}
          style={[
            styles.intervalItem,
            isActive && styles.intervalItemDragging,
            { borderLeftColor: item.color },
          ]}
        >
          {/* 6-Dot Drag Handle on the Far Left */}
          <TouchableOpacity
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              drag();
            }}
            style={styles.intervalDragHandle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons
              name="drag-indicator"
              size={20}
              color={isActive ? Colors.primary : Colors.textScale.muted}
            />
          </TouchableOpacity>

          <View style={styles.intervalInfo}>
            <Text style={styles.intervalName}>{item.name}</Text>
          </View>
          <Text style={styles.intervalDuration}>{formatSeconds(item.duration)}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Custom In-Screen Navigation Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + Spacing.xs }]}>
        <TouchableOpacity
          testID="header-back-button"
          accessibilityLabel={t("common.back", { defaultValue: "Back" })}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {headerTitle}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Header Banner */}
      {isImportMode && (
        <View style={styles.importBanner}>
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.importBannerText}>{t("createTimer.importBanner")}</Text>
        </View>
      )}

      {/* Interval Draggable List Area */}
      <View style={styles.listContainer}>
        <DraggableFlatList
          ref={listRef}
          data={intervals}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          onDragBegin={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onDragEnd={({ data }) => {
            setIntervals(data);
          }}
          renderItem={renderIntervalItem}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <View style={styles.intervalListHeader}>
              <Text style={styles.sectionTitle}>{t("createTimer.intervals")}</Text>
              <TouchableOpacity style={styles.addIntervalLink} onPress={addInterval}>
                <Ionicons name="add-circle" size={18} color={Colors.primary} />
                <Text style={styles.addIntervalLinkText}>{t("createTimer.addInterval")}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Bottom Docked Timer Details Card */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("createTimer.titleDetails")}</Text>

          <View style={styles.editorInputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("createTimer.timerNameLabel")}</Text>
              <TextInput
                style={styles.editorTextInput}
                value={timerName}
                onChangeText={setTimerName}
                placeholder={t("createTimer.timerNamePlaceholder")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 0.55 }]}>
              <Text style={styles.inputLabel}>{t("createTimer.rounds")}</Text>
              <View style={styles.roundsControl}>
                <TouchableOpacity
                  onPress={() => setRounds(Math.max(1, rounds - 1))}
                  style={styles.roundButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="remove" size={16} color="#4B5563" />
                </TouchableOpacity>
                <Text style={styles.roundsValue}>{rounds}</Text>
                <TouchableOpacity
                  onPress={() => setRounds(rounds + 1)}
                  style={styles.roundButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timer Icon-Only Actions */}
          <View style={styles.timerActions}>
            {editTimer && !isImportMode && (
              <TouchableOpacity
                testID="btn-delete-timer"
                accessibilityLabel={t("common.delete")}
                onPress={deleteTimer}
                style={styles.deleteIconButton}
              >
                <Ionicons name="trash-outline" size={22} color="#E63946" />
              </TouchableOpacity>
            )}
            <View style={styles.actionSpacer} />
            <TouchableOpacity
              testID="btn-save-timer"
              accessibilityLabel={t("common.save")}
              onPress={saveTimer}
              style={styles.saveIconButton}
            >
              <Ionicons name="save-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-start-timer"
              accessibilityLabel={t("common.play", { defaultValue: "Start" })}
              onPress={startTimer}
              style={styles.startIconButton}
            >
              <Ionicons name="play" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Edit Interval Bottom Sheet Modal */}
      <EditIntervalModal
        visible={showEditIntervalModal}
        interval={editingInterval}
        onClose={() => {
          setShowEditIntervalModal(false);
          setEditingInterval(null);
        }}
        onUpdate={updateInterval}
        onDelete={deleteSelectedInterval}
        onDuplicate={duplicateSelectedInterval}
        onOpenExercisePicker={() => setShowExercisePicker(true)}
      />

      {/* Exercise Library Picker Modal */}
      <ExercisePickerModal
        visible={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handlePickExercise}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: "#111827",
    maxWidth: "70%",
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  listContainer: {
    flex: 1,
  },
  importBanner: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  importBannerText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSize.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  intervalListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
  },
  addIntervalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addIntervalLinkText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  intervalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  intervalItemDragging: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  intervalDragHandle: {
    paddingRight: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  intervalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: Spacing.xs,
  },
  intervalName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    flex: 1,
  },
  intervalDuration: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginRight: Spacing.xs,
  },
  bottomContainer: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  editorInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  editorTextInput: {
    minHeight: Spacing.touchTarget.min,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  roundsControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    minHeight: Spacing.touchTarget.min,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  roundButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  roundsValue: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    paddingHorizontal: Spacing.sm,
    textAlign: "center",
  },
  timerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionSpacer: {
    flex: 1,
  },
  deleteIconButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#E63946",
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  saveIconButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  startIconButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
