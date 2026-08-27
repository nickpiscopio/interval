import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EXERCISE_CATALOG, getLocalizedExercise, getLocalizedCategoryName } from "../constants/exerciseCatalog";
import { Exercise } from "../model/Exercise";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import { t } from "../i18n";

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES = ["all", "cardio", "upper", "lower", "abs", "total"];

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const localizedList = useMemo(() => {
    return EXERCISE_CATALOG.map(getLocalizedExercise);
  }, [visible]);

  const filteredExercises = useMemo(() => {
    return localizedList.filter((item) => {
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [localizedList, selectedCategory, searchQuery]);

  function handleSelect(item: Exercise) {
    onSelect(item);
    onClose();
  }

  const categoryColors: Record<string, string> = {
    cardio: "#10B981",
    upper: "#3B82F6",
    lower: "#F59E0B",
    abs: "#8B5CF6",
    total: "#EF4444",
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t("exercisePicker.title", { defaultValue: "Exercise Library" })}</Text>
            <Text style={styles.headerSubtitle}>
              {t("exercisePicker.subtitle", { count: filteredExercises.length, defaultValue: `${filteredExercises.length} bodyweight exercises` })}
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
            placeholder={t("exercisePicker.searchPlaceholder", { defaultValue: "Search exercises..." })}
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
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(cat) => cat}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item: cat }) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                    {cat === "all" ? t("exercisePicker.all", { defaultValue: "All" }) : getLocalizedCategoryName(cat)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
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
              <TouchableOpacity style={styles.exerciseCard} onPress={() => handleSelect(item)} activeOpacity={0.65}>
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
                        <Text style={styles.difficultyBadgeText}>
                          {item.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Ionicons name="add-circle" size={24} color="#1ACC6C" />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t("exercisePicker.noResults", { defaultValue: "No exercises found" })}</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginTop: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: "#111827",
  },
  categoriesContainer: {
    paddingVertical: Spacing.xs,
  },
  categoriesList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryChipText: {
    fontSize: FontSize.xs,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing["4xl"],
  },
  separator: {
    height: 8,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: Spacing.sm + 4,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  exerciseCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FontSize.sm,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    marginTop: Spacing.sm,
  },
});
