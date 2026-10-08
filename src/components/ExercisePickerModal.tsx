import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  EXERCISE_CATALOG,
  BODY_PART_CATALOG,
  getLocalizedExercise,
  getLocalizedCategoryName,
  getLocalizedBodyPartName,
} from "../constants/exerciseCatalog";
import { Exercise, BodyPart } from "../model/Exercise";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { t } from "../i18n";

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES = ["all", "corrective", "cardio", "upper", "lower", "abs", "total"];

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      setInspectingExercise(null);
    }
  }, [visible]);

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

  const localizedList = useMemo(() => {
    return EXERCISE_CATALOG.map(getLocalizedExercise);
  }, [visible]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return localizedList.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Body Part filter
      if (selectedBodyPart !== "all") {
        if (!item.bodyParts || !item.bodyParts.includes(selectedBodyPart as BodyPart)) {
          return false;
        }
      }

      // Search matching
      if (!query) return true;

      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = (item.description || "").toLowerCase().includes(query);
      const muscleMatch = (item.targetMuscles || []).some((m) => m.toLowerCase().includes(query));
      const bodyPartMatch = (item.bodyParts || []).some((bp) => {
        const bpName = getLocalizedBodyPartName(bp).toLowerCase();
        return bp.toLowerCase().includes(query) || bpName.includes(query);
      });
      const instructionMatch = item.instructions.some((inst) => inst.toLowerCase().includes(query));

      return nameMatch || descMatch || muscleMatch || bodyPartMatch || instructionMatch;
    });
  }, [localizedList, selectedCategory, selectedBodyPart, searchQuery]);

  function handleClose() {
    setInspectingExercise(null);
    bottomSheetModalRef.current?.dismiss();
    onClose();
  }

  function handleSelect(item: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInspectingExercise(null);
    bottomSheetModalRef.current?.dismiss();
    onSelect(item);
    onClose();
  }

  const categoryColors: Record<string, string> = {
    corrective: "#059669",
    cardio: "#D97706",
    upper: "#2563EB",
    lower: "#7C3AED",
    abs: "#DC2626",
    total: "#0891B2",
  };

  if (!visible) {
    return null;
  }

  const inspectingColor = inspectingExercise
    ? categoryColors[inspectingExercise.category] || Colors.primary
    : Colors.primary;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      stackBehavior="push"
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleBar}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.sheetContainer}>
        {inspectingExercise ? (
          /* ========================================================== */
          /*  EXERCISE DETAIL & INSTRUCTIONS VIEW                       */
          /* ========================================================== */
          <View style={styles.detailContainer}>
            {/* Header: Back & Close */}
            <View style={styles.detailHeader}>
              <TouchableOpacity
                testID="exercise-detail-back-btn"
                accessibilityLabel={t("common.back")}
                style={styles.backButton}
                onPress={() => setInspectingExercise(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.textScale.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                testID="exercise-picker-close-btn"
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Exercise Content */}
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailScrollContent}
            >
              {/* Category & Difficulty Header Tags */}
              <View style={styles.tagsRow}>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: `${inspectingColor}18`,
                      borderColor: `${inspectingColor}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name={inspectingExercise.category === "corrective" ? "medical" : "fitness"}
                    size={13}
                    color={inspectingColor}
                  />
                  <Text style={[styles.categoryBadgeText, { color: inspectingColor }]}>
                    {getLocalizedCategoryName(inspectingExercise.category)}
                  </Text>
                </View>

                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyBadgeText}>
                    {inspectingExercise.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.detailTitle}>{inspectingExercise.name}</Text>

              {/* Body Part Focus */}
              {inspectingExercise.bodyParts && inspectingExercise.bodyParts.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>{t("exercises.bodyPartFocus")}</Text>
                  <View style={styles.bodyPartsWrap}>
                    {inspectingExercise.bodyParts.map((bp: BodyPart) => (
                      <View key={bp} style={styles.detailBodyPartChip}>
                        <Ionicons name="body-outline" size={13} color="#4B5563" />
                        <Text style={styles.detailBodyPartChipText}>
                          {getLocalizedBodyPartName(bp)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Target Muscles */}
              {inspectingExercise.targetMuscles && inspectingExercise.targetMuscles.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>{t("exercises.targetMuscles")}</Text>
                  <View style={styles.bodyPartsWrap}>
                    {inspectingExercise.targetMuscles.map((muscle) => (
                      <View key={muscle} style={styles.muscleChip}>
                        <Text style={styles.muscleChipText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Description & Clinical Benefit */}
              {inspectingExercise.description ? (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>{t("exercises.aboutAndBenefits")}</Text>
                  <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>{inspectingExercise.description}</Text>
                  </View>
                </View>
              ) : null}

              {/* Instructions */}
              {inspectingExercise.instructions && inspectingExercise.instructions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>{t("exercises.instructionsHeading")}</Text>
                  {inspectingExercise.instructions.map((step, idx) => (
                    <View key={idx} style={styles.instructionStepRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </BottomSheetScrollView>

            {/* Sticky Action Footer */}
            <View style={[styles.detailFooter, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
              <TouchableOpacity
                testID="exercise-detail-add-to-timer-btn"
                style={styles.addToTimerButton}
                activeOpacity={0.85}
                onPress={() => handleSelect(inspectingExercise)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addToTimerButtonText}>{t("exercises.addToTimer")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ========================================================== */
          /*  EXERCISE CATALOG LIST & SEARCH VIEW                       */
          /* ========================================================== */
          <View style={styles.catalogContainer}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>{t("exercisePicker.title")}</Text>
                <Text style={styles.headerSubtitle}>
                  {t("exercisePicker.subtitle", { count: filteredExercises.length })}
                </Text>
              </View>
              <TouchableOpacity
                testID="exercise-picker-close-btn"
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
              <BottomSheetTextInput
                style={styles.searchInput}
                placeholder={t("exercisePicker.searchPlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && Platform.OS === "android" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Chips */}
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const isCorrective = cat === "corrective";
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                        isCorrective && !isSelected && styles.correctiveChip,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      {isCorrective && (
                        <Ionicons
                          name="medical"
                          size={12}
                          color={isSelected ? "#FFFFFF" : "#059669"}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                          isCorrective && !isSelected && { color: "#059669", fontWeight: "700" },
                        ]}
                      >
                        {cat === "all" ? t("exercisePicker.all") : getLocalizedCategoryName(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Body Part Filter Chips */}
            <View style={styles.bodyPartsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bodyPartsList}>
                <TouchableOpacity
                  style={[styles.bodyPartChip, selectedBodyPart === "all" && styles.bodyPartChipActive]}
                  onPress={() => setSelectedBodyPart("all")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bodyPartChipText, selectedBodyPart === "all" && styles.bodyPartChipTextActive]}>
                    {t("exercises.allBodyParts")}
                  </Text>
                </TouchableOpacity>
                {BODY_PART_CATALOG.map((bp) => {
                  const isSelected = selectedBodyPart === bp.id;
                  return (
                    <TouchableOpacity
                      key={bp.id}
                      style={[styles.bodyPartChip, isSelected && styles.bodyPartChipActive]}
                      onPress={() => setSelectedBodyPart(bp.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={bp.iconName as any}
                        size={12}
                        color={isSelected ? "#FFFFFF" : "#4B5563"}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.bodyPartChipText, isSelected && styles.bodyPartChipTextActive]}>
                        {getLocalizedBodyPartName(bp.id)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Exercise List */}
            <BottomSheetFlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
              ]}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const badgeColor = categoryColors[item.category] || "#10B981";
                return (
                  <TouchableOpacity
                    style={styles.exerciseCard}
                    onPress={() => setInspectingExercise(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.exerciseCardLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: badgeColor }]} />
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <View style={styles.badgeRow}>
                          <View style={[styles.categoryBadge, { backgroundColor: `${badgeColor}15` }]}>
                            <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                              {getLocalizedCategoryName(item.category)}
                            </Text>
                          </View>
                          <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyBadgeText}>{item.difficulty.toUpperCase()}</Text>
                          </View>
                        </View>
                        {item.description ? (
                          <Text style={styles.exerciseDescSnippet} numberOfLines={2}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Quick Add CTA Button + Details Chevron */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        testID={`btn-quick-add-${item.id}`}
                        style={styles.quickAddButton}
                        activeOpacity={0.8}
                        onPress={() => handleSelect(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.quickAddButtonText}>
                          {t("common.add", { defaultValue: "Add" })}
                        </Text>
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>{t("exercisePicker.emptyTitle")}</Text>
                  <Text style={styles.emptySubtitle}>{t("exercisePicker.emptySubtitle")}</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.surface.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.borderDefault,
    alignSelf: "center",
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: Colors.surface.card,
  },
  catalogContainer: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: Colors.textScale.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textScale.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  backButton: {
    width: TOUCH_TARGET.icon,
    height: TOUCH_TARGET.icon,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  detailTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: Colors.textScale.primary,
    marginBottom: Spacing.sm,
  },
  sectionContainer: {
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textScale.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bodyPartsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  detailBodyPartChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.neutralAction.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  detailBodyPartChipText: {
    fontSize: FontSize.xs,
    color: Colors.textScale.secondary,
    fontWeight: "600",
  },
  muscleChip: {
    backgroundColor: Colors.neutralAction.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  muscleChipText: {
    fontSize: FontSize.xs,
    color: Colors.textScale.secondary,
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: Colors.surface.screen,
    padding: Spacing.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.textScale.primary,
    lineHeight: 20,
  },
  instructionStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${Colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
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
  detailFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  addToTimerButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: TOUCH_TARGET.cta,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.card,
  },
  addToTimerButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.card,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minHeight: TOUCH_TARGET.icon,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textScale.primary,
    paddingVertical: 6,
  },
  categoriesContainer: {
    marginBottom: 6,
  },
  categoriesList: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  correctiveChip: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  categoryChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  bodyPartsContainer: {
    marginBottom: Spacing.xs,
  },
  bodyPartsList: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  bodyPartChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.neutralAction.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  bodyPartChipActive: {
    backgroundColor: Colors.textScale.heading,
    borderColor: Colors.textScale.primary,
  },
  bodyPartChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  bodyPartChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: 8,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface.card,
    padding: Spacing.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  exerciseCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: Spacing.xs,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textScale.primary,
  },
  exerciseDescSnippet: {
    fontSize: FontSize.xs,
    color: Colors.textScale.secondary,
    lineHeight: 16,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.neutralAction.surface,
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  quickAddButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textScale.heading,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textScale.muted,
    marginTop: 4,
  },
});
