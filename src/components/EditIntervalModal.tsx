import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Interval } from "../model/Interval";
import { t } from "../i18n";
import Spacing from "../constants/Spacing";
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
  onClose: () => void;
  onUpdate: (updated: Partial<Interval>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenExercisePicker: () => void;
}

export function EditIntervalModal({
  visible,
  interval,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenExercisePicker,
}: EditIntervalModalProps) {
  const insets = useSafeAreaInsets();
  const [durationInputText, setDurationInputText] = useState<string>("00:00:30");
  const [internalVisible, setInternalVisible] = useState(visible);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (interval) {
      setDurationInputText(formatHHMMSS(interval.duration));
    }
  }, [interval?.id, interval?.duration, visible]);

  const isVisible = visible || internalVisible;
  if (!isVisible || !interval) return null;

  function handleDurationChange(text: string) {
    const rawDigits = text.replace(/\D/g, "");
    const truncated = rawDigits.slice(-6);
    const padded = truncated.padStart(6, "0");
    const formatted = `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
    setDurationInputText(formatted);
    const totalSeconds = parseHHMMSSToSeconds(formatted);
    onUpdate({ duration: totalSeconds });
  }

  function handleDurationBlur() {
    const totalSeconds = parseHHMMSSToSeconds(durationInputText);
    const finalSeconds = totalSeconds < 1 ? 1 : totalSeconds;
    setDurationInputText(formatHHMMSS(finalSeconds));
    onUpdate({ duration: finalSeconds });
  }

  function handleDone() {
    handleDurationBlur();
    onClose();
  }

  function handleDelete() {
    onDelete();
  }

  return (
    <Modal
      visible={visible || internalVisible}
      transparent
      animationType="none"
      onRequestClose={handleDone}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={handleDone}>
          <Animated.View style={[styles.scrim, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("createTimer.titleEdit")}</Text>
            <TouchableOpacity
              testID="edit-interval-done-btn"
              onPress={handleDone}
              style={styles.doneButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.doneButtonText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View style={styles.editorInputRow}>
            {/* Interval Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>{t("createTimer.intervalNamePlaceholder")}</Text>
                <TouchableOpacity
                  style={styles.libraryPickerBtn}
                  onPress={onOpenExercisePicker}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="barbell-outline" size={13} color={Colors.primary} />
                  <Text style={styles.libraryPickerBtnText}>
                    {t("exercisePicker.chooseExercise", { defaultValue: "Library" })}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.editorTextInput}
                value={interval.name}
                onChangeText={(name) => onUpdate({ name })}
                placeholder={t("createTimer.intervalNamePlaceholder")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Duration */}
            <View style={[styles.inputGroup, { flex: 0.55 }]}>
              <Text style={styles.inputLabel}>{t("common.duration")}</Text>
              <TextInput
                style={styles.timeInput}
                value={durationInputText}
                onChangeText={handleDurationChange}
                onBlur={handleDurationBlur}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Color Picker */}
          <Text style={styles.inputLabel}>{t("createTimer.intervalColor")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorPalette}
          >
            {COLOR_PALETTE.map((color) => {
              const isSelected = (interval.color || "#1ACC6C") === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => onUpdate({ color })}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    isSelected && styles.colorCircleSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" testID="icon-checkmark" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Interval Actions: Delete & Duplicate */}
          <View style={styles.intervalActions}>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteIconButton}>
              <Ionicons name="trash-outline" size={22} color="#E63946" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDuplicate} style={styles.duplicateIconButton}>
              <Ionicons name="copy-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: Spacing.radius.lg,
    borderTopRightRadius: Spacing.radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.text,
  },
  doneButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  doneButtonText: {
    fontSize: FontSize.md,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  editorInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
    marginBottom: 4,
  },
  libraryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  libraryPickerBtnText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  editorTextInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.text,
    backgroundColor: "#F9FAFB",
    height: 42,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.text,
    backgroundColor: "#F9FAFB",
    textAlign: "center",
    height: 42,
  },
  colorPalette: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  intervalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  duplicateIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
});