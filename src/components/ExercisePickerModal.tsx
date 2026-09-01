import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
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
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import { t } from "../i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES = ["all", "corrective", "cardio", "upper", "lower", "abs", "total"];

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);

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

  function handleSelect(item: Exercise) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t("exercisePicker.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("exercisePicker.subtitle", { count: filteredExercises.length })}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
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
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const badgeColor = categoryColors[item.category] || "#10B981";
            return (
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() => setInspectingExercise(item)}
                activeOpacity={0.65}
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
                <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
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

        {/* Inspection Detail Modal */}
        <ExerciseDetailModal
          visible={inspectingExercise !== null}
          exercise={inspectingExercise}
          mode="picker"
          onClose={() => setInspectingExercise(null)}
          onSelectExercise={handleSelect}
        />
      </SafeAreaView>
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
    maxHeight: SCREEN_HEIGHT * 0.9,
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
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
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
    borderWidth: 1,
    borderColor: Colors.borderDefault,
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
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
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
