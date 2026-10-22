import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../constants/Colors";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import { Text } from "./Themed";
import { BottomSheetFrame } from "./BottomSheetFrame";
import { Exercise, BodyPart } from "../model/Exercise";
import {
  getLocalizedCategoryName,
  getLocalizedBodyPartName,
} from "../constants/exerciseCatalog";
import { t } from "../i18n";

export interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: Exercise | null;
  mode?: "picker" | "library";
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
  onStartQuickRoutine?: (exercise: Exercise) => void;
  onCreateCustomTimer?: (exercise: Exercise) => void;
}

export function ExerciseDetailModal({
  visible,
  exercise,
  mode = "picker",
  onClose,
  onSelectExercise,
  onStartQuickRoutine,
  onCreateCustomTimer,
}: ExerciseDetailModalProps) {
  if (!visible || !exercise) {
    return null;
  }

  function handleClose() {
    onClose();
  }

  function handleSelect() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSelectExercise) {
      onSelectExercise(exercise!);
    }
    handleClose();
  }

  function handleStartQuickRoutine() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onStartQuickRoutine) {
      onStartQuickRoutine(exercise!);
    }
    handleClose();
  }

  function handleCreateCustomTimer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCreateCustomTimer) {
      onCreateCustomTimer(exercise!);
    }
    handleClose();
  }

  const categoryColorMap: Record<string, string> = {
    corrective: "#059669", // Emerald
    cardio: "#D97706",     // Amber
    upper: "#2563EB",      // Blue
    lower: "#7C3AED",      // Purple
    abs: "#DC2626",        // Red
    total: "#0891B2",      // Cyan
  };

  const badgeColor = categoryColorMap[exercise.category] || Colors.primary;

  return (
    <BottomSheetFrame visible={visible} onClose={onClose}>
      <View style={styles.sheetContainer}>
        {/* Detail Header: Back & Title + Tags */}
        <View testID="exercise-detail-header" style={styles.detailHeader}>
          <TouchableOpacity
            testID="exercise-detail-back-btn"
            accessibilityLabel={t("common.back")}
            style={styles.backButton}
            onPress={handleClose}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textScale.primary} />
          </TouchableOpacity>

          <View style={styles.detailHeaderTitleContainer}>
            <Text testID="exercise-detail-title" style={styles.detailTitle}>{exercise.name}</Text>
            <View testID="exercise-detail-tags-row" style={styles.tagsRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: badgeColor + "18", borderColor: badgeColor + "40" },
                ]}
              >
                <Ionicons
                  name={exercise.category === "corrective" ? "medical" : "fitness"}
                  size={13}
                  color={badgeColor}
                />
                <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                  {getLocalizedCategoryName(exercise.category)}
                </Text>
              </View>

              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyBadgeText}>
                  {exercise.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Friendly Body Part Focus Chips */}
          {exercise.bodyParts && exercise.bodyParts.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {t("exercises.bodyPartFocus")}
              </Text>
              <View style={styles.bodyPartsWrap}>
                {exercise.bodyParts.map((bp: BodyPart) => (
                  <View key={bp} style={styles.bodyPartChip}>
                    <Ionicons name="body-outline" size={13} color="#4B5563" />
                    <Text style={styles.bodyPartChipText}>
                      {getLocalizedBodyPartName(bp)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Target Muscles */}
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {t("exercises.targetMuscles")}
              </Text>
              <View style={styles.bodyPartsWrap}>
                {exercise.targetMuscles.map((muscle) => (
                  <View key={muscle} style={styles.muscleChip}>
                    <Text style={styles.muscleChipText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description / Clinical Benefit */}
          {exercise.description ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {t("exercises.aboutAndBenefits")}
              </Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{exercise.description}</Text>
              </View>
            </View>
          ) : null}

          {/* Step-by-Step Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {t("exercises.instructionsHeading")}
              </Text>
              {exercise.instructions.map((step, idx) => (
                <View key={idx} style={styles.instructionStepRow}>
                  <Text style={styles.stepText}>{`${idx + 1}. ${step}`}</Text>
                </View>
              ))}
            </View>
          )}
        </BottomSheetScrollView>

        {/* Action Buttons Footer */}
        <View style={styles.footerActions}>
          {mode === "library" ? (
            <View style={styles.libraryActionsRow}>
              <TouchableOpacity
                style={styles.quickStartButton}
                activeOpacity={0.85}
                onPress={handleStartQuickRoutine}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={styles.quickStartButtonText}>
                  {t("exercises.startQuickRoutine")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createCustomButton}
                activeOpacity={0.85}
                onPress={handleCreateCustomTimer}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.createCustomButtonText}>
                  {t("exercises.createCustomWorkout")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectButton}
              activeOpacity={0.85}
              onPress={handleSelect}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.selectButtonText}>
                {t("exercises.addToTimer")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BottomSheetFrame>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flexShrink: 1,
  },
  scroll: {
    flexShrink: 1,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  backButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
  },
  detailHeaderTitleContainer: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  detailTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
  },
  difficultyBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.secondary,
    marginBottom: Spacing.inputLabelGap,
  },
  bodyPartsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  bodyPartChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutralAction.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    gap: 5,
  },
  bodyPartChipText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textScale.heading,
  },
  muscleChip: {
    backgroundColor: Colors.surface.tintActive,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.borderInput,
  },
  muscleChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
  },
  descriptionCard: {
    backgroundColor: Colors.surface.screen,
    padding: Spacing.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.textScale.heading,
    lineHeight: 20,
  },
  instructionStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textScale.primary,
    lineHeight: 20,
  },
  footerActions: {
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  libraryActionsRow: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
  quickStartButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: TOUCH_TARGET.cta,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.card,
  },
  quickStartButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  createCustomButton: {
    backgroundColor: Colors.surface.screen,
    borderWidth: 1.5,
    borderColor: Colors.borderDefault,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: TOUCH_TARGET.min,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  createCustomButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  selectButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: TOUCH_TARGET.cta,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.card,
  },
  selectButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
