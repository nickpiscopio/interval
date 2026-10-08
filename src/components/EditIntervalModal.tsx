import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Interval } from "../model/Interval";
import { Spacer } from "./Spacer";
import { t } from "../i18n";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [durationInputText, setDurationInputText] = useState<string>("00:00:30");

  useEffect(() => {
    if (visible && interval) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, interval]);

  useEffect(() => {
    if (interval) {
      setDurationInputText(formatHHMMSS(interval.duration));
    }
  }, [interval?.id, interval?.duration, visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!visible || !interval) {
    return null;
  }

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
    bottomSheetModalRef.current?.dismiss();
    onClose();
  }

  function handleDelete() {
    bottomSheetModalRef.current?.dismiss();
    onDelete();
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing
      maxDynamicContentSize={SCREEN_HEIGHT * 0.9}
      stackBehavior="push"
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleBar}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) },
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
            <BottomSheetTextInput
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
            <BottomSheetTextInput
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
        <View style={styles.colorPalette}>
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
        </View>

        {/* Interval Actions: Delete & Duplicate */}
        <View style={styles.intervalActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteIconButton}>
            <Ionicons name="trash-outline" size={22} color="#E63946" />
          </TouchableOpacity>
          <Spacer />
          <TouchableOpacity onPress={onDuplicate} style={styles.duplicateIconButton}>
            <Ionicons name="copy-outline" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.surface.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOWS.modal,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.borderDefault,
    alignSelf: "center",
  },
  sheetContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
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
    color: Colors.textScale.primary,
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
    color: Colors.textScale.secondary,
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
    borderColor: Colors.borderInput,
    borderRadius: RADIUS.sm,
    paddingHorizontal: Spacing.sm,
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
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  intervalActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
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