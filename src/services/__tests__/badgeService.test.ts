import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserStats,
  saveUserStats,
  getAllBadgesWithStatus,
  recordWorkoutCompletion,
  recordShare,
  recordExerciseSearch,
  recordExerciseInspection,
  DEFAULT_USER_STATS,
} from "../badgeService";
import { BADGE_CATALOG } from "../../constants/badges";
import { Timer } from "../../model/Timer";

describe("badgeService", () => {
  const mockTimer: Timer = {
    id: "timer-1",
    name: "Morning Blast",
    rounds: 2,
    intervals: [
      { id: "i1", name: "Jumping Jacks", duration: 30, color: "#10B981" },
      { id: "i2", name: "Rest", duration: 15, color: "#6B7280" },
    ],
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("returns initial empty user stats if not saved yet", async () => {
    const stats = await getUserStats();
    expect(stats.totalWorkouts).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.unlockedBadgeIds).toEqual([]);
    expect(stats.totalSeconds).toBe(0);
    expect(stats.totalShares).toBe(0);
    expect(stats.totalCorrectiveWorkouts).toBe(0);
    expect(stats.totalCorrectiveIntervals).toBe(0);
    expect(stats.totalSearches).toBe(0);
  });

  it("saves and retrieves user stats", async () => {
    const mockStats = {
      ...DEFAULT_USER_STATS,
      totalWorkouts: 5,
      totalSeconds: 1200,
      currentStreak: 3,
      longestStreak: 5,
      lastWorkoutDate: "2026-08-25",
      lastWorkoutDayOfWeek: 2,
      workedOutSaturday: false,
      workedOutSunday: false,
      totalIntervals: 20,
      importedSharedWorkouts: 0,
      sharedViaSms: false,
      sharedViaEmailOrLink: false,
      unlockedBadgeIds: ["first_step_hero"],
      totalShares: 2,
    };
    await saveUserStats(mockStats);
    const retrieved = await getUserStats();
    expect(retrieved).toEqual(mockStats);
  });

  it("returns all badges with unlocked status", async () => {
    const mockStats = {
      ...DEFAULT_USER_STATS,
      totalWorkouts: 1,
      totalSeconds: 300,
      currentStreak: 1,
      longestStreak: 1,
      lastWorkoutDate: "2026-08-25",
      lastWorkoutDayOfWeek: 2,
      workedOutSaturday: false,
      workedOutSunday: false,
      totalIntervals: 4,
      importedSharedWorkouts: 0,
      sharedViaSms: false,
      sharedViaEmailOrLink: false,
      unlockedBadgeIds: ["first_step_hero"],
      totalShares: 0,
    };
    await saveUserStats(mockStats);

    const badges = await getAllBadgesWithStatus();
    expect(badges.length).toBe(BADGE_CATALOG.length);
    const firstHero = badges.find((b) => b.id === "first_step_hero");
    expect(firstHero?.unlockedAt).toBeTruthy();

    const lockedBadge = badges.find((b) => b.id === "century_club");
    expect(lockedBadge?.unlockedAt).toBeUndefined();
  });

  it("records first workout completion and unlocks first_step_hero badge", async () => {
    const result = await recordWorkoutCompletion(mockTimer, 600);
    expect(result.stats.totalWorkouts).toBe(1);
    expect(result.stats.totalSeconds).toBe(600);
    expect(result.stats.currentStreak).toBe(1);
    expect(result.stats.longestStreak).toBe(1);
    expect(result.newlyUnlocked.some((b) => b.id === "first_step_hero")).toBe(true);
  });

  it("advances streak on consecutive days and updates longestStreak", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 1,
      totalSeconds: 300,
      currentStreak: 1,
      longestStreak: 1,
      lastWorkoutDate: yesterday,
      lastWorkoutDayOfWeek: 1,
      workedOutSaturday: false,
      workedOutSunday: false,
      totalIntervals: 4,
      importedSharedWorkouts: 0,
      sharedViaSms: false,
      sharedViaEmailOrLink: false,
      unlockedBadgeIds: [],
      totalShares: 0,
    });

    const result = await recordWorkoutCompletion(mockTimer, 300);
    expect(result.stats.currentStreak).toBe(2);
    expect(result.stats.longestStreak).toBe(2);
    expect(result.newlyUnlocked.some((b) => b.id === "back_to_back_beast")).toBe(true);
  });

  it("resets streak if more than 1 day was missed", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 3,
      totalSeconds: 900,
      currentStreak: 3,
      longestStreak: 3,
      lastWorkoutDate: twoDaysAgo,
      lastWorkoutDayOfWeek: 0,
      workedOutSaturday: false,
      workedOutSunday: false,
      totalIntervals: 12,
      importedSharedWorkouts: 0,
      sharedViaSms: false,
      sharedViaEmailOrLink: false,
      unlockedBadgeIds: [],
      totalShares: 0,
    });

    const result = await recordWorkoutCompletion(mockTimer, 300);
    expect(result.stats.currentStreak).toBe(1);
    expect(result.stats.longestStreak).toBe(3); // preserved
  });

  it("unlocks volume, streak milestone, and imported shared badges", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-30T12:00:00Z")); // Sunday

    const importedTimer: Timer = {
      id: "ai_shared_123",
      name: "Shared Routine",
      rounds: 5,
      intervals: [
        { id: "1", name: "Pushups", duration: 30, color: "#3B82F6" },
      ],
    };

    const yesterday = "2026-08-29"; // Saturday
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 20,
      totalSeconds: 3500,
      currentStreak: 20,
      longestStreak: 20,
      lastWorkoutDate: yesterday,
      lastWorkoutDayOfWeek: 6,
      workedOutSaturday: true,
      workedOutSunday: true,
      totalIntervals: 98,
      importedSharedWorkouts: 0,
      sharedViaSms: false,
      sharedViaEmailOrLink: false,
      unlockedBadgeIds: [],
      totalShares: 0,
    });

    const result = await recordWorkoutCompletion(importedTimer, 200);
    expect(result.stats.totalSeconds).toBe(3700);
    expect(result.stats.currentStreak).toBe(21);
    expect(result.newlyUnlocked.some((b) => b.id === "habit_machine")).toBe(true);
    expect(result.newlyUnlocked.some((b) => b.id === "hour_of_power")).toBe(true);
    expect(result.newlyUnlocked.some((b) => b.id === "iron_lungs")).toBe(true);
    expect(result.newlyUnlocked.some((b) => b.id === "imported_gains")).toBe(true);
    expect(result.newlyUnlocked.some((b) => b.id === "weekend_warrior")).toBe(true);

    jest.useRealTimers();
  });

  it("records viral sharing via mail/copy and unlocks sharing badges", async () => {
    const shareResult1 = await recordShare("com.apple.UIKit.activity.Message");
    expect(shareResult1.stats.totalShares).toBe(1);
    expect(shareResult1.newlyUnlocked.some((b) => b.id === "megaphone_maestro")).toBe(true);
    expect(shareResult1.newlyUnlocked.some((b) => b.id === "squad_recruiter")).toBe(true);

    const shareResult2 = await recordShare("com.apple.UIKit.activity.Mail");
    expect(shareResult2.newlyUnlocked.some((b) => b.id === "chain_letter_of_gains")).toBe(true);

    await saveUserStats({
      ...shareResult2.stats,
      totalShares: 4,
      unlockedBadgeIds: ["megaphone_maestro", "squad_recruiter", "chain_letter_of_gains"],
    });

    const shareResult3 = await recordShare();
    expect(shareResult3.stats.totalShares).toBe(5);
    expect(shareResult3.newlyUnlocked.some((b) => b.id === "hype_machine")).toBe(true);
  });

  it("unlocks discovery badges for searching and inspecting exercises", async () => {
    const search1 = await recordExerciseSearch("knees");
    expect(search1.stats.totalSearches).toBe(1);
    expect(search1.newlyUnlocked.some((b) => b.id === "curious_explorer")).toBe(true);

    // Search 5 body parts
    await recordExerciseSearch("ankle_feet");
    await recordExerciseSearch("lower_back");
    await recordExerciseSearch("neck");
    const search5 = await recordExerciseSearch("elbows_forearms");
    expect(search5.newlyUnlocked.some((b) => b.id === "anatomical_master")).toBe(true);

    // Inspect 10 exercises
    for (let i = 1; i <= 9; i++) {
      await recordExerciseInspection(`exercise_${i}`);
    }
    const inspect10 = await recordExerciseInspection("exercise_10");
    expect(inspect10.newlyUnlocked.some((b) => b.id === "movement_scholar")).toBe(true);
  });

  it("unlocks corrective badges for completing physical therapy exercises and intervals", async () => {
    const correctiveTimer: Timer = {
      id: "pt_timer_1",
      name: "Tibialis Raises Routine",
      rounds: 5,
      intervals: [
        { id: "c1", name: "Tibialis Raises", duration: 30, color: "#059669", exerciseId: "tibialis_raises" },
        { id: "c2", name: "Wall Angels", duration: 30, color: "#059669", exerciseId: "wall_angels" },
        { id: "c3", name: "Dead Bugs", duration: 30, color: "#059669", exerciseId: "dead_bugs" },
      ],
    };

    // First completion: 15 intervals, 1 workout
    const result1 = await recordWorkoutCompletion(correctiveTimer, 300);
    expect(result1.stats.totalCorrectiveWorkouts).toBe(1);
    expect(result1.stats.totalCorrectiveIntervals).toBe(15);
    expect(result1.newlyUnlocked.some((b) => b.id === "rehab_rookie")).toBe(true);
    expect(result1.newlyUnlocked.some((b) => b.id === "posture_perfectionist")).toBe(true);

    // 5 workouts
    await saveUserStats({
      ...result1.stats,
      totalCorrectiveWorkouts: 4,
    });
    const result5 = await recordWorkoutCompletion(correctiveTimer, 300);
    expect(result5.stats.totalCorrectiveWorkouts).toBe(5);
    expect(result5.newlyUnlocked.some((b) => b.id === "bulletproof_joints")).toBe(true);

    // 10 workouts
    await saveUserStats({
      ...result5.stats,
      totalCorrectiveWorkouts: 9,
    });
    const result10 = await recordWorkoutCompletion(correctiveTimer, 300);
    expect(result10.stats.totalCorrectiveWorkouts).toBe(10);
    expect(result10.newlyUnlocked.some((b) => b.id === "iron_alignment")).toBe(true);
  });
});
