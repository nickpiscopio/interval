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
        <Text style={styles.loadingTitle}>Coaching Engine Active...</Text>
        <Text style={styles.loadingSubtitle}>
          Designing a custom bodyweight HIIT routine tailored to your goals.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        Tell us a little about what you are looking for to allow Interval's AI to create a custom bodyweight exercise timer for you!
      </Text>

      {/* Fitness Goal */}
      <Text style={styles.sectionHeader}>What is your fitness goal?</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, goal === "weight_loss" && styles.chipActive]}
          onPress={() => setGoal("weight_loss")}
        >
          <Text style={[styles.chipText, goal === "weight_loss" && styles.chipTextActive]}>
            Lose weight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, goal === "tone" && styles.chipActive]}
          onPress={() => setGoal("tone")}
        >
          <Text style={[styles.chipText, goal === "tone" && styles.chipTextActive]}>
            Get toned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, goal === "bulk" && styles.chipActive]}
          onPress={() => setGoal("bulk")}
        >
          <Text style={[styles.chipText, goal === "bulk" && styles.chipTextActive]}>
            Bulk up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Focus Area */}
      <Text style={styles.sectionHeader}>What would you like to exercise?</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, area === "total" && styles.chipActive]}
          onPress={() => setArea("total")}
        >
          <Text style={[styles.chipText, area === "total" && styles.chipTextActive]}>
            Total body
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "abs" && styles.chipActive]}
          onPress={() => setArea("abs")}
        >
          <Text style={[styles.chipText, area === "abs" && styles.chipTextActive]}>
            Abs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "lower" && styles.chipActive]}
          onPress={() => setArea("lower")}
        >
          <Text style={[styles.chipText, area === "lower" && styles.chipTextActive]}>
            Lower body
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "cardio" && styles.chipActive]}
          onPress={() => setArea("cardio")}
        >
          <Text style={[styles.chipText, area === "cardio" && styles.chipTextActive]}>
            Cardio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "upper" && styles.chipActive]}
          onPress={() => setArea("upper")}
        >
          <Text style={[styles.chipText, area === "upper" && styles.chipTextActive]}>
            Upper body
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, area === "surprise" && styles.chipActive]}
          onPress={() => setArea("surprise")}
        >
          <Text style={[styles.chipText, area === "surprise" && styles.chipTextActive]}>
            Surprise me!
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fitness Experience Level */}
      <Text style={styles.sectionHeader}>What is your fitness experience?</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, experience === "beginner" && styles.chipActive]}
          onPress={() => setExperience("beginner")}
        >
          <Text style={[styles.chipText, experience === "beginner" && styles.chipTextActive]}>
            Beginner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, experience === "intermediate" && styles.chipActive]}
          onPress={() => setExperience("intermediate")}
        >
          <Text style={[styles.chipText, experience === "intermediate" && styles.chipTextActive]}>
            Intermediate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, experience === "advanced" && styles.chipActive]}
          onPress={() => setExperience("advanced")}
        >
          <Text style={[styles.chipText, experience === "advanced" && styles.chipTextActive]}>
            Advanced
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
          colors={["#10B981", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.generateButton}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.generateButtonText}>Generate Timer</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  description: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 28,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginBottom: 12,
    marginTop: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#374151",
  },
  chipTextActive: {
    color: "#1D4ED8",
    fontFamily: "Poppins-Bold",
  },
  generateButtonContainer: {
    height: 54,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  generateButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
