import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { RootStackScreenProps } from "../types";
import { generateWorkout, GeneratorParams } from "../services/timerGenerator";
import { t } from "../i18n";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

export default function GenerateTimerScreen({
  navigation,
}: RootStackScreenProps<"GenerateTimer">) {
  // Survey Selections
  const [goal, setGoal] = useState<GeneratorParams["goal"]>("weight_loss");
  const [area, setArea] = useState<GeneratorParams["area"]>("total");
  const [experience, setExperience] = useState<GeneratorParams["experience"]>("beginner");
  const [generating, setGenerating] = useState(false);

  // Run generation rules-engine and navigate
  function handleGenerate() {
    setGenerating(true);
    // Simulate AI thinking for a premium feel
    setTimeout(() => {
      const generatedTimer = generateWorkout({ goal, area, experience });
      setGenerating(false);
      // Route to CreateTimer in preview state
      navigation.navigate("CreateTimer", { timer: generatedTimer });
    }, 1500);
  }

  if (generating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingTitle}>{t("generateTimer.loadingTitle")}</Text>
        <Text style={styles.loadingSubtitle}>
          {t("generateTimer.loadingSubtitle")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        {t("generateTimer.description")}
      </Text>

      {/* Fitness Goal */}
      <Text style={styles.sectionHeader}>{t("generateTimer.goalQuestion")}</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, goal === "weight_loss" && styles.chipActive]}
          onPress={() => setGoal("weight_loss")}
        >
          <Text style={[styles.chipText, goal === "weight_loss" && styles.chipTextActive]}>
            {t("generateTimer.goalWeightLoss")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, goal === "tone" && styles.chipActive]}
          onPress={() => setGoal("tone")}
        >
          <Text style={[styles.chipText, goal === "tone" && styles.chipTextActive]}>
            {t("generateTimer.goalTone")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, goal === "bulk" && styles.chipActive]}
          onPress={() => setGoal("bulk")}
        >
          <Text style={[styles.chipText, goal === "bulk" && styles.chipTextActive]}>
            {t("generateTimer.goalBulk")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Focus Area */}
      <Text style={styles.sectionHeader}>{t("generateTimer.areaQuestion")}</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, area === "total" && styles.chipActive]}
          onPress={() => setArea("total")}
        >
          <Text style={[styles.chipText, area === "total" && styles.chipTextActive]}>
            {t("generateTimer.areaTotal")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "abs" && styles.chipActive]}
          onPress={() => setArea("abs")}
        >
          <Text style={[styles.chipText, area === "abs" && styles.chipTextActive]}>
            {t("generateTimer.areaAbs")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "lower" && styles.chipActive]}
          onPress={() => setArea("lower")}
        >
          <Text style={[styles.chipText, area === "lower" && styles.chipTextActive]}>
            {t("generateTimer.areaLower")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "cardio" && styles.chipActive]}
          onPress={() => setArea("cardio")}
        >
          <Text style={[styles.chipText, area === "cardio" && styles.chipTextActive]}>
            {t("generateTimer.areaCardio")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "upper" && styles.chipActive]}
          onPress={() => setArea("upper")}
        >
          <Text style={[styles.chipText, area === "upper" && styles.chipTextActive]}>
            {t("generateTimer.areaUpper")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "surprise" && styles.chipActive]}
          onPress={() => setArea("surprise")}
        >
          <Text style={[styles.chipText, area === "surprise" && styles.chipTextActive]}>
            {t("generateTimer.areaSurprise")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fitness Experience Level */}
      <Text style={styles.sectionHeader}>{t("generateTimer.experienceQuestion")}</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, experience === "beginner" && styles.chipActive]}
          onPress={() => setExperience("beginner")}
        >
          <Text style={[styles.chipText, experience === "beginner" && styles.chipTextActive]}>
            {t("generateTimer.experienceBeginner")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, experience === "intermediate" && styles.chipActive]}
          onPress={() => setExperience("intermediate")}
        >
          <Text style={[styles.chipText, experience === "intermediate" && styles.chipTextActive]}>
            {t("generateTimer.experienceIntermediate")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, experience === "advanced" && styles.chipActive]}
          onPress={() => setExperience("advanced")}
        >
          <Text style={[styles.chipText, experience === "advanced" && styles.chipTextActive]}>
            {t("generateTimer.experienceAdvanced")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generate Action Button */}
      <TouchableOpacity
        style={styles.generateButtonContainer}
        activeOpacity={0.9}
        onPress={handleGenerate}
      >
        <LinearGradient
          colors={Colors.aiGradient}
          start={Colors.aiGradientCoordinates.start}
          end={Colors.aiGradientCoordinates.end}
          style={styles.generateButton}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.generateButtonText}>{t("generateTimer.generateButton")}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  chip: {
    minHeight: Spacing.touchTarget.min,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.full,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  chipText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: "#374151",
    textAlign: "center",
  },
  chipTextActive: {
    color: "#1D4ED8",
    fontFamily: "Poppins-Bold",
  },
  generateButtonContainer: {
    minHeight: Spacing.touchTarget.cta,
    borderRadius: Spacing.radius.md,
    overflow: "hidden",
    marginTop: Spacing.md,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  generateButton: {
    width: "100%",
    minHeight: Spacing.touchTarget.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  loadingTitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  loadingSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});
