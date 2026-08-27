import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../constants/Colors";
import Spacing, { RADIUS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import { Text } from "./Themed";
import { Exercise, BodyPart } from "../model/Exercise";
import {
  getLocalizedCategoryName,
  getLocalizedBodyPartName,
} from "../constants/exerciseCatalog";
import { t } from "../i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  if (!exercise) return null;

  function handleSelect() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSelectExercise) {
      onSelectExercise(exercise!);
    }
    onClose();
  }

  function handleStartQuickRoutine() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onStartQuickRoutine) {
      onStartQuickRoutine(exercise!);
    }
    onClose();
  }

  function handleCreateCustomTimer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCreateCustomTimer) {
      onCreateCustomTimer(exercise!);
    }
    onClose();
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header Handle */}
              <View style={styles.handleBar} />

              {/* Close Button */}
              <TouchableOpacity
                testID="exercise-detail-close-btn"
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Category & Difficulty Header Tags */}
                <View style={styles.tagsRow}>
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

                {/* Exercise Title */}
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>

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
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: Spacing.xs,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
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
    backgroundColor: "#F3F4F6",
  },
  difficultyBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: "#4B5563",
  },
  exerciseTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: "#111827",
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  sectionContainer: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  bodyPartsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  bodyPartChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    gap: 5,
  },
  bodyPartChipText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: "#374151",
  },
  muscleChip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  muscleChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  descriptionCard: {
    backgroundColor: "#F9FAFB",
    padding: Spacing.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: "#374151",
    lineHeight: 20,
  },
  instructionStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: "#4B5563",
    lineHeight: 20,
  },
  footerActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
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
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStartButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  createCustomButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
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
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: 8,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
