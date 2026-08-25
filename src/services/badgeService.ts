import AsyncStorage from "@react-native-async-storage/async-storage";
import { Badge, UserStats } from "../model/Badge";
import { Timer } from "../model/Timer";
import { BADGE_CATALOG } from "../constants/badges";

const USER_STATS_KEY = "@interval_user_stats";
const UNLOCKED_TIMESTAMPS_KEY = "@interval_badge_timestamps";

export const DEFAULT_USER_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: "",
  lastWorkoutDayOfWeek: -1,
  workedOutSaturday: false,
  workedOutSunday: false,
  totalWorkouts: 0,
  totalSeconds: 0,
  totalIntervals: 0,
  unlockedBadgeIds: [],
};

function getFormattedDate(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayFormattedDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getFormattedDate(d);
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const raw = await AsyncStorage.getItem(USER_STATS_KEY);
    if (!raw) return DEFAULT_USER_STATS;
    return { ...DEFAULT_USER_STATS, ...JSON.parse(raw) };
  } catch (error) {
    console.warn("Failed to load user stats:", error);
    return DEFAULT_USER_STATS;
  }
}

export async function saveUserStats(stats: UserStats): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to save user stats:", error);
  }
}

export async function getBadgeTimestamps(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(UNLOCKED_TIMESTAMPS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveBadgeTimestamps(timestamps: Record<string, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(UNLOCKED_TIMESTAMPS_KEY, JSON.stringify(timestamps));
  } catch (error) {
    console.warn("Failed to save badge timestamps:", error);
  }
}

export async function recordWorkoutCompletion(
  timer: Timer,
  workoutSeconds: number
): Promise<{ newlyUnlocked: Badge[]; stats: UserStats }> {
  const stats = await getUserStats();
  const timestamps = await getBadgeTimestamps();
  const now = new Date();
  const today = getFormattedDate(now);
  const yesterday = getYesterdayFormattedDate();
  const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours();

  // Streak calculations
  let currentStreak = stats.currentStreak;
  let workedOutSaturday = stats.workedOutSaturday;
  let workedOutSunday = stats.workedOutSunday;

  if (stats.lastWorkoutDate === today) {
    // Already worked out today; streak maintained
  } else if (stats.lastWorkoutDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  // Weekend tracking
  if (dayOfWeek === 6) {
    workedOutSaturday = true;
  } else if (dayOfWeek === 0) {
    workedOutSunday = true;
  } else {
    // Weekday: reset weekend trackers for the upcoming weekend
    if (dayOfWeek === 1) {
      workedOutSaturday = false;
      workedOutSunday = false;
    }
  }

  const longestStreak = Math.max(stats.longestStreak, currentStreak);
  const totalWorkouts = stats.totalWorkouts + 1;
  const totalSeconds = stats.totalSeconds + workoutSeconds;
  const totalIntervals = stats.totalIntervals + timer.intervals.length * timer.rounds;

  const currentUnlocked = new Set(stats.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

  // Helper to test and unlock
  function checkAndUnlock(badgeId: string, condition: boolean) {
    if (condition && !currentUnlocked.has(badgeId)) {
      currentUnlocked.add(badgeId);
      const badgeDef = BADGE_CATALOG.find((b) => b.id === badgeId);
      if (badgeDef) {
        newlyUnlocked.push(badgeDef);
        timestamps[badgeId] = Date.now();
      }
    }
  }

  // Evaluate Criteria
  checkAndUnlock("first_step_hero", totalWorkouts >= 1);
  checkAndUnlock("spaghetti_legs", currentStreak >= 3);
  checkAndUnlock("sweat_monster", currentStreak >= 7);
  checkAndUnlock("unstoppable_dynamo", currentStreak >= 30);
  checkAndUnlock("weekend_warrior", workedOutSaturday && workedOutSunday);
  checkAndUnlock("ten_minute_tornado", totalSeconds >= 600);
  checkAndUnlock("hour_of_power", totalSeconds >= 3600);
  checkAndUnlock("century_club", totalIntervals >= 100);
  checkAndUnlock("early_bird", hour < 8);
  checkAndUnlock("night_owl", hour >= 20);
  checkAndUnlock("iron_lungs", timer.rounds >= 5);
  checkAndUnlock("custom_creator", !timer.isAiGenerated);

  const updatedStats: UserStats = {
    currentStreak,
    longestStreak,
    lastWorkoutDate: today,
    lastWorkoutDayOfWeek: dayOfWeek,
    workedOutSaturday,
    workedOutSunday,
    totalWorkouts,
    totalSeconds,
    totalIntervals,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  await saveUserStats(updatedStats);
  if (newlyUnlocked.length > 0) {
    await saveBadgeTimestamps(timestamps);
  }

  return { newlyUnlocked, stats: updatedStats };
}

export async function getAllBadgesWithStatus(): Promise<Badge[]> {
  const stats = await getUserStats();
  const timestamps = await getBadgeTimestamps();
  const unlockedSet = new Set(stats.unlockedBadgeIds || []);

  return BADGE_CATALOG.map((badge) => ({
    ...badge,
    unlockedAt: unlockedSet.has(badge.id) ? timestamps[badge.id] || 1 : undefined,
  }));
}
