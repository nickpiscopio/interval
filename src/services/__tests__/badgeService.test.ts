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

  describe("rapid-repeat (5-minute window) and daily multi-workout (1-hour spacing) achievements", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it("unlocks 2-in-a-row (quick_double) and 3-in-a-row (quick_triple) when started within 5 minutes of previous completion", async () => {
      jest.useFakeTimers();
      // Workout 1 finishes at 10:00:00 (duration 60s)
      jest.setSystemTime(new Date("2026-11-02T10:00:00Z"));
      const r1 = await recordWorkoutCompletion(mockTimer, 60);
      expect(r1.stats.consecutiveQuickRepeatCount).toBe(1);
      expect(r1.newlyUnlocked.some((b) => b.id === "quick_double")).toBe(false);

      // Workout 2 starts 4 minutes later at 10:04:00 and lasts 90s -> finishes at 10:05:30
      jest.setSystemTime(new Date("2026-11-02T10:05:30Z"));
      const r2 = await recordWorkoutCompletion(mockTimer, 90);
      expect(r2.stats.consecutiveQuickRepeatCount).toBe(2);
      expect(r2.newlyUnlocked.some((b) => b.id === "quick_double")).toBe(true);
      expect(r2.newlyUnlocked.some((b) => b.id === "quick_triple")).toBe(false);

      // Workout 3 starts exactly 5 minutes after 10:05:30 -> at 10:10:30, lasts 60s -> finishes at 10:11:30
      jest.setSystemTime(new Date("2026-11-02T10:11:30Z"));
      const r3 = await recordWorkoutCompletion(mockTimer, 60);
      expect(r3.stats.consecutiveQuickRepeatCount).toBe(3);
      expect(r3.newlyUnlocked.some((b) => b.id === "quick_triple")).toBe(true);
    });

    it("resets consecutiveQuickRepeatCount when gap between previous completion and next start exceeds 5 minutes", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-11-02T10:00:00Z"));
      await recordWorkoutCompletion(mockTimer, 60);

      // Next workout starts 5 minutes and 1 second later at 10:05:01, lasts 60s -> finishes at 10:06:01
      jest.setSystemTime(new Date("2026-11-02T10:06:01Z"));
      const r2 = await recordWorkoutCompletion(mockTimer, 60);
      expect(r2.stats.consecutiveQuickRepeatCount).toBe(1);
      expect(r2.newlyUnlocked.some((b) => b.id === "quick_double")).toBe(false);
    });

    it("unlocks Two-a-Day and Three-a-Day only when same-day workouts are spaced at least 1 hour apart", async () => {
      jest.useFakeTimers();
      // First workout at 08:00:00
      jest.setSystemTime(new Date("2026-11-02T08:00:00"));
      const r1 = await recordWorkoutCompletion(mockTimer, 300);
      expect(r1.stats.todaySpacedWorkoutTimestamps?.length).toBe(1);
      expect(r1.newlyUnlocked.some((b) => b.id === "two_a_day")).toBe(false);

      // Quick repeat 30 mins later at 08:30:00 -> should NOT count toward 1-hour spaced workouts
      jest.setSystemTime(new Date("2026-11-02T08:30:00"));
      const rQuick = await recordWorkoutCompletion(mockTimer, 300);
      expect(rQuick.stats.todaySpacedWorkoutTimestamps?.length).toBe(1);
      expect(rQuick.newlyUnlocked.some((b) => b.id === "two_a_day")).toBe(false);

      // Second spaced workout at 09:00:00 (1 hour after 08:00:00) -> unlocks Two-a-Day
      jest.setSystemTime(new Date("2026-11-02T09:00:00"));
      const r2 = await recordWorkoutCompletion(mockTimer, 300);
      expect(r2.stats.todaySpacedWorkoutTimestamps?.length).toBe(2);
      expect(r2.newlyUnlocked.some((b) => b.id === "two_a_day")).toBe(true);
      expect(r2.newlyUnlocked.some((b) => b.id === "three_a_day")).toBe(false);

      // Third spaced workout at 10:30:00 (1.5 hours after 09:00:00) -> unlocks Three-a-Day
      jest.setSystemTime(new Date("2026-11-02T10:30:00"));
      const r3 = await recordWorkoutCompletion(mockTimer, 300);
      expect(r3.stats.todaySpacedWorkoutTimestamps?.length).toBe(3);
      expect(r3.newlyUnlocked.some((b) => b.id === "three_a_day")).toBe(true);
    });

    it("unlocks 2-day and 3-day consecutive Two-a-Day streak achievements and resets if a day is missed", async () => {
      jest.useFakeTimers();

      // Day 1 (Nov 2): Two-a-Day
      jest.setSystemTime(new Date("2026-11-02T08:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-02T12:00:00"));
      const day1 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day1.stats.consecutiveTwoADayDays).toBe(1);
      expect(day1.newlyUnlocked.some((b) => b.id === "two_a_day_streak_2")).toBe(false);

      // Day 2 (Nov 3): Two-a-Day -> unlocks 2-day Two-a-Day streak
      jest.setSystemTime(new Date("2026-11-03T09:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-03T18:00:00"));
      const day2 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day2.stats.consecutiveTwoADayDays).toBe(2);
      expect(day2.newlyUnlocked.some((b) => b.id === "two_a_day_streak_2")).toBe(true);
      expect(day2.newlyUnlocked.some((b) => b.id === "two_a_day_streak_3")).toBe(false);

      // Day 3 (Nov 4): Two-a-Day -> unlocks 3-day Two-a-Day streak
      jest.setSystemTime(new Date("2026-11-04T07:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-04T19:00:00"));
      const day3 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day3.stats.consecutiveTwoADayDays).toBe(3);
      expect(day3.newlyUnlocked.some((b) => b.id === "two_a_day_streak_3")).toBe(true);

      // Skip Nov 5, then do a Two-a-Day on Nov 6 -> resets consecutiveTwoADayDays to 1
      jest.setSystemTime(new Date("2026-11-06T08:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-06T12:00:00"));
      const dayAfterGap = await recordWorkoutCompletion(mockTimer, 300);
      expect(dayAfterGap.stats.consecutiveTwoADayDays).toBe(1);
    });

    it("unlocks 2-day and 3-day consecutive Three-a-Day streak achievements and resets if a day is missed", async () => {
      jest.useFakeTimers();

      // Day 1 (Nov 2): Three-a-Day (3 workouts spaced >= 1 hour apart)
      jest.setSystemTime(new Date("2026-11-02T08:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-02T12:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-02T18:00:00"));
      const day1 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day1.stats.consecutiveThreeADayDays).toBe(1);
      expect(day1.newlyUnlocked.some((b) => b.id === "three_a_day_streak_2")).toBe(false);

      // Day 2 (Nov 3): Three-a-Day -> unlocks 2-day Three-a-Day streak (Triple-Day Duo)
      jest.setSystemTime(new Date("2026-11-03T08:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-03T13:00:00"));
      const day2Workout2 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day2Workout2.newlyUnlocked.some((b) => b.id === "two_a_day_streak_2")).toBe(true);
      expect(day2Workout2.newlyUnlocked.some((b) => b.id === "three_a_day_streak_2")).toBe(false);

      jest.setSystemTime(new Date("2026-11-03T19:00:00"));
      const day2Workout3 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day2Workout3.stats.consecutiveThreeADayDays).toBe(2);
      expect(day2Workout3.newlyUnlocked.some((b) => b.id === "three_a_day_streak_2")).toBe(true);
      expect(day2Workout3.newlyUnlocked.some((b) => b.id === "three_a_day_streak_3")).toBe(false);

      // Day 3 (Nov 4): Three-a-Day -> unlocks 3-day Three-a-Day streak (Three-a-Day Dynasty)
      jest.setSystemTime(new Date("2026-11-04T07:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-04T12:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-04T20:00:00"));
      const day3 = await recordWorkoutCompletion(mockTimer, 300);
      expect(day3.stats.consecutiveThreeADayDays).toBe(3);
      expect(day3.newlyUnlocked.some((b) => b.id === "three_a_day_streak_3")).toBe(true);

      // Skip Nov 5, then do a Three-a-Day on Nov 6 -> resets consecutiveThreeADayDays to 1
      jest.setSystemTime(new Date("2026-11-06T08:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-06T12:00:00"));
      await recordWorkoutCompletion(mockTimer, 300);
      jest.setSystemTime(new Date("2026-11-06T18:00:00"));
      const dayAfterGap = await recordWorkoutCompletion(mockTimer, 300);
      expect(dayAfterGap.stats.consecutiveThreeADayDays).toBe(1);
    });
  });

  describe("Timer Variety Badges", () => {
    const makeTimer = (id: string, overrides: Partial<Timer> = {}): Timer => ({
      ...mockTimer,
      id,
      name: `Timer ${id}`,
      ...overrides,
    });

    it("records unique timer IDs in completedTimerIds and deduplicates repeated completions", async () => {
      const initialStats = await getUserStats();
      expect(initialStats.completedTimerIds).toEqual([]);

      const first = await recordWorkoutCompletion(makeTimer("timer-a"), 120);
      expect(first.stats.completedTimerIds).toEqual(["timer-a"]);

      // Repeating the same timer ID does not duplicate it
      const repeat = await recordWorkoutCompletion(makeTimer("timer-a"), 120);
      expect(repeat.stats.completedTimerIds).toEqual(["timer-a"]);

      // Completing a second distinct timer appends its ID
      const second = await recordWorkoutCompletion(makeTimer("timer-b"), 120);
      expect(second.stats.completedTimerIds).toEqual(["timer-a", "timer-b"]);

      // Persisted stats retain the deduplicated IDs
      const persisted = await getUserStats();
      expect(persisted.completedTimerIds).toEqual(["timer-a", "timer-b"]);
    });

    it("counts all Timer origins and deduplicates repeated quick routines and temp_timer", async () => {
      // 1. Bundled default timer
      await recordWorkoutCompletion(makeTimer("default_hiit"), 120);
      // 2. Custom timer
      await recordWorkoutCompletion(makeTimer("custom_12345", { createdAt: 1700000000000 }), 120);
      // 3. AI-generated timer (isAiGenerated: true, with createdAt)
      await recordWorkoutCompletion(
        makeTimer("ai_generated_1", { isAiGenerated: true, createdAt: 1700000001000 }),
        120
      );
      // 4. Imported shared timer (ai_* without createdAt)
      const r4 = await recordWorkoutCompletion(makeTimer("ai_shared_999"), 120);
      expect(r4.stats.completedTimerIds).toHaveLength(4);
      expect(r4.newlyUnlocked.some((b) => b.id === "variety_5")).toBe(false);

      // 5. Deterministic Quick Routine -> reaches 5 distinct timers and unlocks variety_5
      const r5 = await recordWorkoutCompletion(makeTimer("quick_tibialis_raises"), 120);
      expect(r5.stats.completedTimerIds).toHaveLength(5);
      expect(r5.newlyUnlocked.some((b) => b.id === "variety_5")).toBe(true);

      // Repeating the same Quick Routine does not increment the count
      const r5Repeat = await recordWorkoutCompletion(makeTimer("quick_tibialis_raises"), 120);
      expect(r5Repeat.stats.completedTimerIds).toHaveLength(5);
      expect(r5Repeat.newlyUnlocked.some((b) => b.id === "variety_5")).toBe(false);

      // 6. Unsaved temporary timer ("temp_timer") counts once
      const rTemp1 = await recordWorkoutCompletion(makeTimer("temp_timer"), 120);
      expect(rTemp1.stats.completedTimerIds).toHaveLength(6);
      expect(rTemp1.stats.completedTimerIds).toContain("temp_timer");

      // Repeating "temp_timer" (even with different names/intervals) still counts only once
      const rTemp2 = await recordWorkoutCompletion(
        makeTimer("temp_timer", { name: "Different Ad-Hoc Routine" }),
        120
      );
      expect(rTemp2.stats.completedTimerIds).toHaveLength(6);
    });

    it("unlocks variety_5, variety_10, variety_25, and variety_50 at exact thresholds without duplicate unlocks", async () => {
      const thresholds: Array<{ count: number; badgeId: string }> = [
        { count: 5, badgeId: "variety_5" },
        { count: 10, badgeId: "variety_10" },
        { count: 25, badgeId: "variety_25" },
        { count: 50, badgeId: "variety_50" },
      ];

      let completed = 0;
      for (const { count, badgeId } of thresholds) {
        // Advance up to count - 1
        while (completed < count - 1) {
          completed += 1;
          const res = await recordWorkoutCompletion(makeTimer(`timer_${completed}`), 60);
          expect(res.newlyUnlocked.some((b) => b.id === badgeId)).toBe(false);
        }

        // Exact threshold completion unlocks the badge
        completed += 1;
        const unlockRes = await recordWorkoutCompletion(makeTimer(`timer_${completed}`), 60);
        expect(unlockRes.stats.completedTimerIds).toHaveLength(count);
        expect(unlockRes.newlyUnlocked.some((b) => b.id === badgeId)).toBe(true);

        // Repeating an existing timer or completing another new timer does NOT re-unlock the same badge
        const repeatRes = await recordWorkoutCompletion(makeTimer(`timer_${completed}`), 60);
        expect(repeatRes.newlyUnlocked.some((b) => b.id === badgeId)).toBe(false);

        completed += 1;
        const nextRes = await recordWorkoutCompletion(makeTimer(`timer_${completed}`), 60);
        expect(nextRes.newlyUnlocked.some((b) => b.id === badgeId)).toBe(false);
      }
    });

    it("loads legacy persisted stats without completedTimerIds cleanly and tracks from zero", async () => {
      // Simulate legacy persisted stats written before completedTimerIds existed
      const { completedTimerIds: _omitted, ...legacyStats } = DEFAULT_USER_STATS;
      await AsyncStorage.setItem(
        "@interval_user_stats",
        JSON.stringify({
          ...legacyStats,
          totalWorkouts: 12,
          unlockedBadgeIds: ["first_step_hero"],
        })
      );

      const loaded = await getUserStats();
      expect(loaded.completedTimerIds).toEqual([]);
      expect(loaded.totalWorkouts).toBe(12);

      const result = await recordWorkoutCompletion(makeTimer("legacy_followup_1"), 120);
      expect(result.stats.completedTimerIds).toEqual(["legacy_followup_1"]);
      expect(result.stats.totalWorkouts).toBe(13);
    });

    it("preserves permanent lifetime timer credit and reflects unlocked variety badges in getAllBadgesWithStatus", async () => {
      for (let i = 1; i <= 5; i++) {
        await recordWorkoutCompletion(makeTimer(`permanent_timer_${i}`), 60);
      }

      // Even after completing other timers (and regardless of whether earlier timers are later deleted from storage),
      // lifetime credit for previously completed timer IDs is retained.
      await recordWorkoutCompletion(makeTimer("permanent_timer_6"), 60);
      const stats = await getUserStats();
      expect(stats.completedTimerIds).toEqual([
        "permanent_timer_1",
        "permanent_timer_2",
        "permanent_timer_3",
        "permanent_timer_4",
        "permanent_timer_5",
        "permanent_timer_6",
      ]);

      const allBadges = await getAllBadgesWithStatus();
      const variety5 = allBadges.find((b) => b.id === "variety_5");
      const variety10 = allBadges.find((b) => b.id === "variety_10");
      const variety25 = allBadges.find((b) => b.id === "variety_25");
      const variety50 = allBadges.find((b) => b.id === "variety_50");

      expect(variety5?.unlockedAt).toBeTruthy();
      expect(variety10?.unlockedAt).toBeUndefined();
      expect(variety25?.unlockedAt).toBeUndefined();
      expect(variety50?.unlockedAt).toBeUndefined();
    });
  });
});
