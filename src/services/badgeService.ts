import AsyncStorage from "@react-native-async-storage/async-storage";
import { Badge, UserStats } from "../model/Badge";
import { Timer } from "../model/Timer";
import { BADGE_CATALOG } from "../constants/badges";
import { EXERCISE_CATALOG } from "../constants/exerciseCatalog";

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
  totalShares: 0,
  sharedViaSms: false,
  sharedViaEmailOrLink: false,
  importedSharedWorkouts: 0,
  totalCorrectiveWorkouts: 0,
  totalCorrectiveIntervals: 0,
  totalSearches: 0,
  exploredBodyParts: [],
  inspectedExerciseIds: [],
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
  const isImportedTimer = Boolean(timer.id.startsWith("ai_") && !timer.createdAt);
  const importedSharedWorkouts = stats.importedSharedWorkouts + (isImportedTimer ? 1 : 0);

  // Corrective calculations
  const correctiveIntervalCount = timer.intervals.filter((interval) => {
    if (interval.exerciseId) {
      const found = EXERCISE_CATALOG.find((e) => e.id === interval.exerciseId);
      if (found && found.category === "corrective") return true;
    }
    const foundByName = EXERCISE_CATALOG.find(
      (e) => e.name.toLowerCase() === interval.name.toLowerCase()
    );
    if (foundByName && foundByName.category === "corrective") return true;
    return false;
  }).length * timer.rounds;

  const isCorrectiveWorkout = correctiveIntervalCount > 0;
  const totalCorrectiveWorkouts = (stats.totalCorrectiveWorkouts || 0) + (isCorrectiveWorkout ? 1 : 0);
  const totalCorrectiveIntervals = (stats.totalCorrectiveIntervals || 0) + correctiveIntervalCount;
  const totalSearches = stats.totalSearches || 0;
  const exploredBodyParts = stats.exploredBodyParts || [];
  const inspectedExerciseIds = stats.inspectedExerciseIds || [];

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
  checkAndUnlock("back_to_back_beast", currentStreak >= 2);
  checkAndUnlock("spaghetti_legs", currentStreak >= 3);
  checkAndUnlock("workweek_warrior", currentStreak >= 5);
  checkAndUnlock("sweat_monster", currentStreak >= 7);
  checkAndUnlock("fortnight_of_fire", currentStreak >= 14);
  checkAndUnlock("habit_machine", currentStreak >= 21);
  checkAndUnlock("unstoppable_dynamo", currentStreak >= 30);
  checkAndUnlock("iron_will", currentStreak >= 60);
  checkAndUnlock("quarterly_crusher", currentStreak >= 90);
  checkAndUnlock("half_year_hero", currentStreak >= 180);
  checkAndUnlock("sun_god_of_sweat", currentStreak >= 365);
  checkAndUnlock("weekend_warrior", workedOutSaturday && workedOutSunday);
  checkAndUnlock("ten_minute_tornado", totalSeconds >= 600);
  checkAndUnlock("hour_of_power", totalSeconds >= 3600);
  checkAndUnlock("century_club", totalIntervals >= 100);
  checkAndUnlock("early_bird", hour < 8);
  checkAndUnlock("night_owl", hour >= 20);
  checkAndUnlock("iron_lungs", timer.rounds >= 5);
  checkAndUnlock("custom_creator", !timer.isAiGenerated);
  checkAndUnlock("imported_gains", importedSharedWorkouts >= 1);

  // Discovery Badges
  checkAndUnlock("curious_explorer", totalSearches >= 1 || exploredBodyParts.length >= 1);
  checkAndUnlock("anatomical_master", exploredBodyParts.length >= 5);
  checkAndUnlock("movement_scholar", inspectedExerciseIds.length >= 10);

  // Corrective Badges
  checkAndUnlock("rehab_rookie", totalCorrectiveWorkouts >= 1 || totalCorrectiveIntervals >= 1);
  checkAndUnlock("bulletproof_joints", totalCorrectiveWorkouts >= 5);
  checkAndUnlock("posture_perfectionist", totalCorrectiveIntervals >= 15);
  checkAndUnlock("iron_alignment", totalCorrectiveWorkouts >= 10);

  const updatedStats: UserStats = {
    ...stats,
    currentStreak,
    longestStreak,
    lastWorkoutDate: today,
    lastWorkoutDayOfWeek: dayOfWeek,
    workedOutSaturday,
    workedOutSunday,
    totalWorkouts,
    totalSeconds,
    totalIntervals,
    importedSharedWorkouts,
    totalCorrectiveWorkouts,
    totalCorrectiveIntervals,
    totalSearches,
    exploredBodyParts,
    inspectedExerciseIds,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  await saveUserStats(updatedStats);
  if (newlyUnlocked.length > 0) {
    await saveBadgeTimestamps(timestamps);
  }

  return { newlyUnlocked, stats: updatedStats };
}

export async function recordExerciseSearch(
  bodyPart?: string
): Promise<{ newlyUnlocked: Badge[]; stats: UserStats }> {
  const stats = await getUserStats();
  const timestamps = await getBadgeTimestamps();

  const totalSearches = (stats.totalSearches || 0) + 1;
  const exploredSet = new Set(stats.exploredBodyParts || []);
  if (bodyPart && bodyPart !== "all") {
    exploredSet.add(bodyPart);
  }
  const exploredBodyParts = Array.from(exploredSet);

  const currentUnlocked = new Set(stats.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

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

  checkAndUnlock("curious_explorer", totalSearches >= 1 || exploredBodyParts.length >= 1);
  checkAndUnlock("anatomical_master", exploredBodyParts.length >= 5);

  const updatedStats: UserStats = {
    ...stats,
    totalSearches,
    exploredBodyParts,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  await saveUserStats(updatedStats);
  if (newlyUnlocked.length > 0) {
    await saveBadgeTimestamps(timestamps);
  }

  return { newlyUnlocked, stats: updatedStats };
}

export async function recordExerciseInspection(
  exerciseId: string,
  bodyParts?: string[]
): Promise<{ newlyUnlocked: Badge[]; stats: UserStats }> {
  const stats = await getUserStats();
  const timestamps = await getBadgeTimestamps();

  const inspectedSet = new Set(stats.inspectedExerciseIds || []);
  inspectedSet.add(exerciseId);
  const inspectedExerciseIds = Array.from(inspectedSet);

  const exploredSet = new Set(stats.exploredBodyParts || []);
  if (bodyParts) {
    bodyParts.forEach((bp) => exploredSet.add(bp));
  }
  const exploredBodyParts = Array.from(exploredSet);

  const currentUnlocked = new Set(stats.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

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

  checkAndUnlock("curious_explorer", exploredBodyParts.length >= 1 || inspectedExerciseIds.length >= 1);
  checkAndUnlock("anatomical_master", exploredBodyParts.length >= 5);
  checkAndUnlock("movement_scholar", inspectedExerciseIds.length >= 10);

  const updatedStats: UserStats = {
    ...stats,
    exploredBodyParts,
    inspectedExerciseIds,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  await saveUserStats(updatedStats);
  if (newlyUnlocked.length > 0) {
    await saveBadgeTimestamps(timestamps);
  }

  return { newlyUnlocked, stats: updatedStats };
}

export async function recordShare(
  activityType?: string | null
): Promise<{ newlyUnlocked: Badge[]; stats: UserStats }> {
  const stats = await getUserStats();
  const timestamps = await getBadgeTimestamps();

  const totalShares = (stats.totalShares || 0) + 1;
  let sharedViaSms = stats.sharedViaSms;
  let sharedViaEmailOrLink = stats.sharedViaEmailOrLink;

  const act = (activityType || "").toLowerCase();
  if (
    act.includes("message") ||
    act.includes("sms") ||
    act.includes("whatsapp") ||
    act.includes("telegram") ||
    act.includes("signal")
  ) {
    sharedViaSms = true;
  }
  if (
    act.includes("mail") ||
    act.includes("airdrop") ||
    act.includes("copy") ||
    act.includes("pasteboard")
  ) {
    sharedViaEmailOrLink = true;
  }

  const currentUnlocked = new Set(stats.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

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

  checkAndUnlock("megaphone_maestro", totalShares >= 1);
  checkAndUnlock("squad_recruiter", sharedViaSms);
  checkAndUnlock("chain_letter_of_gains", sharedViaEmailOrLink);
  checkAndUnlock("hype_machine", totalShares >= 5);
  checkAndUnlock("sweat_influencer", totalShares >= 10);
  checkAndUnlock("chief_fitness_officer", totalShares >= 25);
  checkAndUnlock("viral_phenomenon", totalShares >= 50);
  checkAndUnlock("cult_leader_of_cardio", totalShares >= 100);
  checkAndUnlock("galactic_ambassador", totalShares >= 1000);

  const updatedStats: UserStats = {
    ...stats,
    totalShares,
    sharedViaSms,
    sharedViaEmailOrLink,
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
    unlockedAt: unlockedSet.has(badge.id) ? timestamps[badge.id] || Date.now() : undefined,
  }));
}
