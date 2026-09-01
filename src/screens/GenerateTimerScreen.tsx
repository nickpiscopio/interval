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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { RootStackScreenProps } from "../types";
import { generateWorkout, GeneratorParams } from "../services/timerGenerator";
import { t } from "../i18n";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

export default function GenerateTimerScreen({
  navigation,
}: RootStackScreenProps<"GenerateTimer">) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.screen}>
      {/* Custom In-Screen Navigation Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + Spacing.xs }]}>
        <TouchableOpacity
          testID="header-back-button"
          accessibilityLabel={t("common.back", { defaultValue: "Back" })}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {t("generateTimer.title")}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface.screen,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface.card,
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
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textScale.primary,
    maxWidth: "70%",
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: TOUCH_TARGET.icon,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.surface.screen,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.secondary,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
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
    minHeight: TOUCH_TARGET.min,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface.card,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface.tintActive,
  },
  chipText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: Colors.textScale.primary,
    textAlign: "center",
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: "Poppins-Bold",
  },
  generateButtonContainer: {
    minHeight: TOUCH_TARGET.cta,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginTop: Spacing.md,
    ...SHADOWS.fab,
  },
  generateButton: {
    width: "100%",
    minHeight: TOUCH_TARGET.cta,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  generateButtonText: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.surface.screen,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingTitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.lineHeight.xl,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  loadingSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.secondary,
    textAlign: "center",
  },
});
