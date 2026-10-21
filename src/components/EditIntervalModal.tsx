import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Interval } from "../model/Interval";
import { Exercise } from "../model/Exercise";
import { Spacer } from "./Spacer";
import { BottomSheetFrame } from "./BottomSheetFrame";
import { ExercisePickerView } from "./ExercisePickerView";
import { t } from "../i18n";
import {
  INTERVAL_SOUNDS,
  NONE_SOUND_ID,
  resolveSoundId,
  resolveSoundSource,
} from "../constants/Sounds";
import Spacing, { RADIUS, TOUCH_TARGET } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

const COLOR_PALETTE = [
  "#1ACC6C", // Green
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8338EC", // Purple
  "#E63946", // Red
  "#F95738", // Orange
  "#F9C74F"  // Yellow
];

function formatHHMMSS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(isNaN(totalSeconds) ? 0 : totalSeconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function parseHHMMSSToSeconds(formatted: string): number {
  const digits = formatted.replace(/\D/g, "").slice(-6).padStart(6, "0");
  const hrs = parseInt(digits.slice(0, 2), 10) || 0;
  const mins = parseInt(digits.slice(2, 4), 10) || 0;
  const secs = parseInt(digits.slice(4, 6), 10) || 0;
  return hrs * 3600 + mins * 60 + secs;
}

export interface EditIntervalModalProps {
  visible: boolean;
  interval: Interval | null;
  sequenceNumber?: number;
  onClose: () => void;
  onUpdate: (updated: Partial<Interval>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenExercisePicker?: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
}

export function EditIntervalModal({
  visible,
  interval,
  sequenceNumber,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenExercisePicker,
  onSelectExercise,
}: EditIntervalModalProps) {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<"edit" | "library">("edit");
  const [durationInputText, setDurationInputText] = useState<string>("00:00:30");
  const previewPlayerRef = useRef<AudioPlayer | null>(null);

  function releasePreview() {
    if (previewPlayerRef.current) {
      previewPlayerRef.current.release();
      previewPlayerRef.current = null;
    }
  }

  useEffect(() => releasePreview, []);

  useEffect(() => {
    if (!visible) {
      setViewMode("edit");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (viewMode === "library") {
        setViewMode("edit");
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [visible, viewMode]);

  function handleSelectSound(id: string) {
    onUpdate({ sound: id });
    releasePreview();
    const source = resolveSoundSource(id);
    if (!source) return;
    try {
      const player = createAudioPlayer(source);
      previewPlayerRef.current = player;
      player.play();
    } catch (e) {
      console.warn("Failed to preview sound:", e);
    }
  }

  useEffect(() => {
    if (interval) {
      if (interval.duration > 0) {
        setDurationInputText(formatHHMMSS(interval.duration));
      } else if (interval.duration === 0) {
        setDurationInputText("00:00:00");
      } else {
        setDurationInputText("");
      }
    }
  }, [interval?.id, interval?.duration, visible]);

  if (!visible || !interval) {
    return null;
  }

  function handleDurationChange(text: string) {
    const rawDigits = text.replace(/\D/g, "");
    if (!rawDigits) {
      setDurationInputText("");
      onUpdate({ duration: -1 });
      return;
    }
    const truncated = rawDigits.slice(-6);
    const padded = truncated.padStart(6, "0");
    const formatted = `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
    setDurationInputText(formatted);
    const totalSeconds = parseHHMMSSToSeconds(formatted);
    onUpdate({ duration: totalSeconds });
  }

  function handleDurationBlur() {
    if (!durationInputText) {
      return;
    }
    const totalSeconds = parseHHMMSSToSeconds(durationInputText);
    setDurationInputText(formatHHMMSS(totalSeconds));
    onUpdate({ duration: totalSeconds });
  }

  function handleDone() {
    handleDurationBlur();
    onClose();
  }

  function handleDelete() {
    onDelete();
  }

  function handleOpenLibrary() {
    onOpenExercisePicker?.();
    setViewMode("library");
  }

  function handleSelectExercise(exercise: Exercise) {
    const categoryColors: Record<string, string> = {
      cardio: "#1ACC6C",
      corrective: "#10B981",
      upper: "#3B82F6",
      lower: "#F9C74F",
      abs: "#8338EC",
      total: "#E63946",
    };
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      onUpdate({
        name: exercise.name,
        exerciseId: exercise.id,
        color: categoryColors[exercise.category] || interval?.color || "#1ACC6C",
      });
    }
    setViewMode("edit");
  }

  return (
    <BottomSheetFrame
      visible={visible}
      onClose={onClose}
      snapPoints={viewMode === "library" ? ["90%"] : undefined}
    >
      {viewMode === "library" ? (
        <ExercisePickerView
          onBack={() => setViewMode("edit")}
          onSelect={handleSelectExercise}
        />
      ) : (
        <BottomSheetScrollView
          testID="edit-interval-sheet"
          style={styles.sheetScroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + Spacing.lg, 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View testID="edit-interval-header" style={styles.header}>
            <Text style={styles.title}>{t("createTimer.titleEdit")}</Text>
            <TouchableOpacity
              testID="edit-interval-done-btn"
              accessibilityLabel={t("common.done", { defaultValue: "Done" })}
              onPress={handleDone}
              style={styles.doneIconButton}
            >
              <Ionicons
                name="checkmark-sharp"
                size={24}
                color={Colors.primary}
                testID="edit-interval-done-icon"
              />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View testID="edit-interval-input-row" style={styles.editorInputRow}>
            {/* Interval Name */}
            <View style={styles.inputGroup}>
              <View testID="edit-interval-name-label-row" style={styles.inputLabelRow}>
                <Text testID="edit-interval-name-label" style={[styles.inputLabel, styles.inputLabelInRow]}>
                  {t("createTimer.intervalNameLabel")}
                </Text>
                <TouchableOpacity
                  testID="edit-interval-library-btn"
                  style={styles.libraryPickerBtn}
                  onPress={handleOpenLibrary}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={13}
                    color={Colors.primary}
                    style={styles.libraryPickerIcon}
                  />
                  <Text style={styles.libraryPickerBtnText}>
                    {t("exercisePicker.chooseExercise", { defaultValue: "Library" })}
                  </Text>
                </TouchableOpacity>
              </View>
              <BottomSheetTextInput
                testID="edit-interval-name-input"
                style={styles.editorTextInput}
                value={interval.name}
                onChangeText={(name) => onUpdate({ name })}
                placeholder={
                  sequenceNumber
                    ? t("createTimer.defaultIntervalName", { number: sequenceNumber })
                    : t("createTimer.intervalNamePlaceholder")
                }
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Duration */}
            <View style={[styles.inputGroup, { flex: 0.55 }]}>
              <View testID="edit-interval-duration-label-row" style={styles.inputLabelRow}>
                <Text testID="edit-interval-duration-label" style={[styles.inputLabel, styles.inputLabelInRow]}>
                  {t("common.duration")}
                </Text>
              </View>
              <BottomSheetTextInput
                testID="edit-interval-duration-input"
                style={styles.timeInput}
                value={durationInputText}
                onChangeText={handleDurationChange}
                onBlur={handleDurationBlur}
                placeholder="00:00:30"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Color Picker */}
          <Text testID="edit-interval-color-label" style={styles.inputLabel}>
            {t("createTimer.intervalColor")}
          </Text>
          <View testID="edit-interval-color-palette" style={styles.colorPalette}>
            {COLOR_PALETTE.map((color) => {
              const isSelected = (interval.color || "#1ACC6C") === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => onUpdate({ color })}
                  style={[styles.colorCircle, { backgroundColor: color }]}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" testID="icon-checkmark" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sound Picker */}
          <Text testID="edit-interval-sound-label" style={styles.inputLabel}>
            {t("createTimer.intervalSound")}
          </Text>
          <View testID="edit-interval-sound-palette" style={styles.soundPalette}>
            {[
              ...INTERVAL_SOUNDS.map((s) => ({ id: s.id, label: t(s.labelKey) })),
              { id: NONE_SOUND_ID, label: t("createTimer.soundNone") },
            ].map((sound) => {
              const isSelected = resolveSoundId(interval.sound) === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  testID={`sound-pill-${sound.id}`}
                  onPress={() => handleSelectSound(sound.id)}
                  style={[styles.soundPill, isSelected && styles.soundPillSelected]}
                  activeOpacity={0.8}
                >
                  <Text
                    testID={`sound-pill-text-${sound.id}`}
                    style={[styles.soundPillText, isSelected && styles.soundPillTextSelected]}
                  >
                    {sound.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interval Actions: Delete & Duplicate */}
          <View testID="edit-interval-actions" style={styles.intervalActions}>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteIconButton}>
              <Ionicons name="trash-outline" size={22} color="#E63946" />
            </TouchableOpacity>
            <Spacer />
            <TouchableOpacity onPress={onDuplicate} style={styles.duplicateIconButton}>
              <Ionicons name="copy-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      )}
    </BottomSheetFrame>
  );
}

const styles = StyleSheet.create({
  sheetScroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
  },
  doneIconButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -10,
  },
  editorInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 20,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.secondary,
    marginBottom: Spacing.sm,
  },
  inputLabelInRow: {
    marginBottom: 0,
  },
  libraryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  libraryPickerIcon: {
    transform: [{ translateY: -1 }, { translateX: -1 }],
  },
  libraryPickerBtnText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  editorTextInput: {
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: RADIUS.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.primary,
    backgroundColor: Colors.surface.screen,
    minHeight: TOUCH_TARGET.min,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: RADIUS.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.primary,
    backgroundColor: Colors.surface.screen,
    textAlign: "center",
    minHeight: TOUCH_TARGET.min,
  },
  colorPalette: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  soundPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  soundPill: {
    minHeight: TOUCH_TARGET.min,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface.card,
    justifyContent: "center",
    alignItems: "center",
  },
  soundPillSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface.tintActive,
  },
  soundPillText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: Colors.textScale.primary,
    textAlign: "center",
  },
  soundPillTextSelected: {
    color: Colors.primary,
    fontFamily: "Poppins-Bold",
  },
  intervalActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    marginBottom: Spacing.xs,
  },
  deleteIconButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.destructiveSurface,
    borderWidth: 1,
    borderColor: Colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  duplicateIconButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.neutralAction.surface,
    borderWidth: 1,
    borderColor: Colors.neutralAction.border,
    alignItems: "center",
    justifyContent: "center",
  },
});