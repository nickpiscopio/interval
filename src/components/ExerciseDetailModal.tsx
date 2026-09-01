import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  View,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../constants/Colors";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
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
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible]);

  const isVisible = visible || internalVisible;
  if (!isVisible || !exercise) return null;

  function handleClose() {
    onClose();
  }

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
      visible={visible || internalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}>
              {/* Header Handle */}
              <View style={styles.handleBar} />

              {/* Close Button */}
              <TouchableOpacity
                testID="exercise-detail-close-btn"
                style={styles.closeButton}
                onPress={handleClose}
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
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.surface.overlay,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: Colors.surface.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: Spacing.sm,
    ...SHADOWS.modal,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.borderDefault,
    alignSelf: "center",
    marginBottom: Spacing.xs,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 18,
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
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
    backgroundColor: Colors.neutralAction.surface,
  },
  difficultyBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  exerciseTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: Colors.textScale.primary,
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  sectionContainer: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textScale.secondary,
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
    color: Colors.textScale.primary,
    lineHeight: 20,
  },
  footerActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
