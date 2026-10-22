import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetTextInput,
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

export interface ExercisePickerViewProps {
  onBack?: () => void;
  onClose?: () => void;
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES = ["all", "corrective", "cardio", "upper", "lower", "abs", "total"];

export function ExercisePickerView({ onBack, onClose, onSelect }: ExercisePickerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);

  const localizedList = useMemo(() => {
    return EXERCISE_CATALOG.map(getLocalizedExercise);
  }, []);

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
    onClose?.();
  }

  function handleSelect(item: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInspectingExercise(null);
    onSelect(item);
  }

  const categoryColors: Record<string, string> = {
    corrective: "#059669",
    cardio: "#D97706",
    upper: "#2563EB",
    lower: "#7C3AED",
    abs: "#DC2626",
    total: "#0891B2",
  };

  const inspectingColor = inspectingExercise
    ? categoryColors[inspectingExercise.category] || Colors.primary
    : Colors.primary;

  return (
    <View style={styles.sheetContainer}>
      {inspectingExercise ? (
        /* ========================================================== */
        /*  EXERCISE DETAIL & INSTRUCTIONS VIEW                       */
        /* ========================================================== */
        <View style={styles.detailContainer}>
          {/* Detail Header: Back button, Title adjacent, Badges beneath */}
          <View testID="exercise-detail-header" style={styles.detailHeader}>
            <TouchableOpacity
              testID="exercise-detail-back-btn"
              accessibilityLabel={t("common.back")}
              style={styles.backButton}
              onPress={() => setInspectingExercise(null)}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textScale.primary} />
            </TouchableOpacity>

            <View style={styles.detailHeaderTitleContainer}>
              <Text testID="exercise-detail-title" style={styles.detailTitle}>{inspectingExercise.name}</Text>
              <View testID="exercise-detail-tags-row" style={styles.tagsRow}>
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
            </View>
          </View>

          {/* Scrollable Exercise Content */}
          <BottomSheetScrollView
            style={styles.flexShrink}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailScrollContent}
          >

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
                    <Text style={styles.stepText}>{`${idx + 1}. ${step}`}</Text>
                  </View>
                ))}
              </View>
            )}
          </BottomSheetScrollView>

          {/* Sticky Action Footer */}
          <View style={styles.detailFooter}>
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
            <View style={styles.headerLeftRow}>
              {onBack && (
                <TouchableOpacity
                  testID="exercise-picker-back-btn"
                  accessibilityLabel={t("common.back")}
                  style={styles.backButton}
                  onPress={onBack}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.textScale.primary} />
                </TouchableOpacity>
              )}
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>{t("exercisePicker.title")}</Text>
                <Text style={styles.headerSubtitle}>
                  {t("exercisePicker.subtitle", { count: filteredExercises.length })}
                </Text>
              </View>
            </View>
            {onClose && (
              <TouchableOpacity
                testID="exercise-picker-close-btn"
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          <View testID="exercise-search-bar" style={styles.searchBar}>
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
            <ScrollView
              testID="categories-carousel"
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            >
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
            <ScrollView
              testID="body-parts-carousel"
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bodyPartsList}
            >
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
            style={styles.flexShrink}
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Spacing.sm },
            ]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const badgeColor = categoryColors[item.category] || "#10B981";
              return (
                <TouchableOpacity
                  testID={`exercise-card-${item.id}`}
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
  );
}

const styles = StyleSheet.create({
  flexShrink: {
    flexShrink: 1,
  },
  sheetContainer: {
    flexShrink: 1,
    marginHorizontal: -Spacing.md,
    backgroundColor: Colors.surface.card,
  },
  catalogContainer: {
    flexShrink: 1,
  },
  detailContainer: {
    flexShrink: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
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
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
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
  detailScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
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
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textScale.primary,
    lineHeight: 20,
  },
  detailFooter: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
    ...SHADOWS.card,
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
    marginHorizontal: Spacing.md,
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
