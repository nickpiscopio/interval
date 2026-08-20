import { StyleSheet, View, Text, TouchableOpacity, Share } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackScreenProps } from "../types";
import { encodeBase64 } from "../utils/base64";

export default function CompletionScreen({
  route,
  navigation,
}: RootStackScreenProps<"Completion">) {
  const { timer } = route.params;

  // Calculate total seconds worked
  const totalSeconds = timer.intervals.reduce((sum, int) => sum + int.duration, 0) * timer.rounds;

  function formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ""}`;
    }
    return `${secs}s`;
  }

  // Handle native sharing triggers
  async function handleShare() {
    try {
      // Create a clean payload to keep query parameter small
      const sharePayload = {
        name: timer.name,
        rounds: timer.rounds,
        intervals: timer.intervals.map((int) => ({
          name: int.name,
          duration: int.duration,
          color: int.color,
          exerciseId: int.exerciseId,
        })),
      };

      const base64Data = encodeBase64(JSON.stringify(sharePayload));
      const deepLink = `interval://import?data=${base64Data}`;
      
      const appStoreLink = "https://apps.apple.com/app/hiit-interval-timer/id12345678";
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.interval.hiittimer";

      const shareMessage = `I just smashed my workout using Interval! ⚡️\n\nTry my custom timer "${timer.name}" (${timer.rounds} rounds, ${formatTime(totalSeconds)} duration):\n\n1. Download the app:\nApp Store: ${appStoreLink}\nPlay Store: ${playStoreLink}\n\n2. Open this link to load the timer:\n${deepLink}`;

      await Share.share({
        message: shareMessage,
        title: `Share Workout: ${timer.name}`,
      });
    } catch (error) {
      console.warn("Error sharing workout:", error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <LinearGradient
        colors={["#FFFBEB", "#FEF3C7"]}
        style={styles.celebrationBg}
      >
        <View style={styles.trophyContainer}>
          <Ionicons name="trophy" size={100} color="#F59E0B" />
          <Text style={styles.badgeText}>COMPLETED</Text>
        </View>

        <Text style={styles.title}>You Crushed It! 🎉</Text>
        <Text style={styles.subtitle}>Another successful HIIT session in the books.</Text>
      </LinearGradient>

      {/* Workout Stats Details */}
      <View style={styles.statsCard}>
        <Text style={styles.workoutTitle}>{timer.name}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{formatTime(totalSeconds)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rounds</Text>
            <Text style={styles.statValue}>{timer.rounds} Rounds</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="fitness-outline" size={18} color="#4B5563" />
          <Text style={styles.infoText}>
            Completed {timer.intervals.filter(i => i.exerciseId).length * timer.rounds} active exercise intervals!
          </Text>
        </View>
      </View>

      {/* Share / Back buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.shareButtonContainer}
          activeOpacity={0.9}
          onPress={handleShare}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            style={styles.shareButton}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" style={styles.icon} />
            <Text style={styles.shareButtonText}>Share Workout with Friends</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.8}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "space-between",
  },
  celebrationBg: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  trophyContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#D97706",
    letterSpacing: 2,
    marginTop: 8,
    backgroundColor: "#FEF3C7",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 40,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: -20,
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
    flexShrink: 1,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  shareButtonContainer: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  icon: {
    marginRight: 6,
  },
  doneButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#4B5563",
  },
});
