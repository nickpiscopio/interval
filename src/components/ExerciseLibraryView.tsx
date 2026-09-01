import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../constants/Colors";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import { Text } from "./Themed";
import { Exercise, BodyPart } from "../model/Exercise";
import {
  EXERCISE_CATALOG,
  BODY_PART_CATALOG,
  getLocalizedExercise,
  getLocalizedCategoryName,
  getLocalizedBodyPartName,
} from "../constants/exerciseCatalog";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { recordExerciseSearch, recordExerciseInspection } from "../services/badgeService";
import { t } from "../i18n";

export interface ExerciseLibraryViewProps {
  onStartQuickRoutine: (exercise: Exercise) => void;
  onCreateCustomTimer: (exercise: Exercise) => void;
  bottomPadding?: number;
}

const CATEGORIES = [
  "all",
  "corrective",
  "cardio",
  "upper",
  "lower",
  "abs",
  "total",
] as const;

export function ExerciseLibraryView({
  onStartQuickRoutine,
  onCreateCustomTimer,
  bottomPadding = 80,
}: ExerciseLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const localizedCatalog = useMemo(() => {
    return EXERCISE_CATALOG.map(getLocalizedExercise);
  }, []);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return localizedCatalog.filter((exercise) => {
      // 1. Category Filter
      if (selectedCategory !== "all" && exercise.category !== selectedCategory) {
        return false;
      }

      // 2. Body Part Filter
      if (selectedBodyPart !== "all") {
        if (!exercise.bodyParts || !exercise.bodyParts.includes(selectedBodyPart as BodyPart)) {
          return false;
        }
      }

      // 3. Deep Text Search Filter
      if (!query) return true;

      const nameMatch = exercise.name.toLowerCase().includes(query);
      const descMatch = (exercise.description || "").toLowerCase().includes(query);
      const muscleMatch = (exercise.targetMuscles || []).some((m) =>
        m.toLowerCase().includes(query)
      );
      const bodyPartMatch = (exercise.bodyParts || []).some((bp) => {
        const bpName = getLocalizedBodyPartName(bp).toLowerCase();
        return bp.toLowerCase().includes(query) || bpName.includes(query);
      });
      const instructionMatch = exercise.instructions.some((inst) =>
        inst.toLowerCase().includes(query)
      );

      return nameMatch || descMatch || muscleMatch || bodyPartMatch || instructionMatch;
    });
  }, [localizedCatalog, searchQuery, selectedCategory, selectedBodyPart]);

  function handleCardPress(exercise: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordExerciseInspection(exercise.id, exercise.bodyParts);
    setSelectedExercise(exercise);
  }

  function handleSearchChange(text: string) {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      recordExerciseSearch(selectedBodyPart);
    }
  }

  function handleBodyPartSelect(bpId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBodyPart(bpId);
    recordExerciseSearch(bpId);
  }

  const categoryColorMap: Record<string, string> = {
    corrective: "#059669",
    cardio: "#D97706",
    upper: "#2563EB",
    lower: "#7C3AED",
    abs: "#DC2626",
    total: "#0891B2",
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("exercises.searchPlaceholder")}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearchChange}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            testID="clear-search-btn"
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterPillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isCorrective = cat === "corrective";
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                  isCorrective && !isSelected && styles.correctivePillUnselected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(cat);
                }}
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
                    styles.filterPillText,
                    isSelected && styles.filterPillTextSelected,
                    isCorrective && !isSelected && { color: "#059669", fontWeight: "700" },
                  ]}
                >
                  {cat === "all"
                    ? t("exercises.allCategories")
                    : getLocalizedCategoryName(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Body Part Filter Pills */}
      <View style={styles.bodyPartPillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bodyPartPillsRow}
        >
          <TouchableOpacity
            style={[
              styles.bodyPartPill,
              selectedBodyPart === "all" && styles.bodyPartPillSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedBodyPart("all");
            }}
          >
            <Text
              style={[
                styles.bodyPartPillText,
                selectedBodyPart === "all" && styles.bodyPartPillTextSelected,
              ]}
            >
              {t("exercises.allBodyParts")}
            </Text>
          </TouchableOpacity>

          {BODY_PART_CATALOG.map((bp) => {
            const isSelected = selectedBodyPart === bp.id;
            return (
              <TouchableOpacity
                key={bp.id}
                style={[
                  styles.bodyPartPill,
                  isSelected && styles.bodyPartPillSelected,
                ]}
                onPress={() => handleBodyPartSelect(bp.id)}
              >
                <Ionicons
                  name={bp.iconName as any}
                  size={13}
                  color={isSelected ? "#FFFFFF" : "#4B5563"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.bodyPartPillText,
                    isSelected && styles.bodyPartPillTextSelected,
                  ]}
                >
                  {getLocalizedBodyPartName(bp.id)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCountText}>
          {t("exercises.resultsCount", { count: filteredExercises.length })}
        </Text>
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        renderItem={({ item }) => {
          const badgeColor = categoryColorMap[item.category] || Colors.primary;
          return (
            <TouchableOpacity
              style={styles.exerciseCard}
              activeOpacity={0.7}
              onPress={() => handleCardPress(item)}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.cardTagsRow}>
                    <View
                      style={[
                        styles.cardCategoryBadge,
                        { backgroundColor: badgeColor + "14", borderColor: badgeColor + "35" },
                      ]}
                    >
                      <Text style={[styles.cardCategoryBadgeText, { color: badgeColor }]}>
                        {getLocalizedCategoryName(item.category)}
                      </Text>
                    </View>
                    <View style={styles.cardDifficultyBadge}>
                      <Text style={styles.cardDifficultyText}>
                        {item.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>

              {/* Description Snippet */}
              {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Body Part Badges */}
              {item.bodyParts && item.bodyParts.length > 0 && (
                <View style={styles.cardBodyPartsRow}>
                  {item.bodyParts.slice(0, 3).map((bp) => (
                    <View key={bp} style={styles.cardBodyPartChip}>
                      <Text style={styles.cardBodyPartChipText}>
                        {getLocalizedBodyPartName(bp)}
                      </Text>
                    </View>
                  ))}
                  {item.bodyParts.length > 3 && (
                    <Text style={styles.cardMoreBodyPartsText}>
                      +{item.bodyParts.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={44} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>{t("exercises.noExercisesFound")}</Text>
            <Text style={styles.emptyStateSubtitle}>
              {t("exercises.noExercisesSubtitle")}
            </Text>
          </View>
        }
      />

      {/* Exercise Detail Sheet */}
      <ExerciseDetailModal
        visible={selectedExercise !== null}
        exercise={selectedExercise}
        mode="library"
        onClose={() => setSelectedExercise(null)}
        onStartQuickRoutine={onStartQuickRoutine}
        onCreateCustomTimer={onCreateCustomTimer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.screen,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.card,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: 12,
    minHeight: TOUCH_TARGET.icon,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    ...SHADOWS.card,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textScale.primary,
    paddingVertical: 8,
  },
  filterPillsWrapper: {
    marginBottom: 6,
  },
  filterPillsRow: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  filterPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  correctivePillUnselected: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },
  filterPillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  filterPillTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  bodyPartPillsWrapper: {
    marginBottom: Spacing.xs,
  },
  bodyPartPillsRow: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  bodyPartPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.neutralAction.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  bodyPartPillSelected: {
    backgroundColor: Colors.textScale.heading,
    borderColor: Colors.textScale.primary,
  },
  bodyPartPillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  bodyPartPillTextSelected: {
    color: Colors.white,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    marginBottom: 6,
  },
  resultsCountText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textScale.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    ...SHADOWS.card,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderInfo: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  cardTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textScale.primary,
    marginBottom: 4,
  },
  cardTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  cardCategoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardDifficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.neutralAction.surface,
  },
  cardDifficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  cardDescription: {
    fontSize: FontSize.xs,
    color: Colors.textScale.secondary,
    lineHeight: 18,
    marginTop: 8,
  },
  cardBodyPartsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  cardBodyPartChip: {
    backgroundColor: Colors.neutralAction.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  cardBodyPartChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textScale.secondary,
  },
  cardMoreBodyPartsText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textScale.muted,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textScale.heading,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textScale.muted,
    textAlign: "center",
    maxWidth: 240,
  },
});
