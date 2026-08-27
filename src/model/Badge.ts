export interface Badge {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  tagline: string;
  description: string;
  category: "streak" | "volume" | "feat" | "timing" | "sharing" | "discovery" | "corrective";
  gradientColors: [string, string];
  unlockedAt?: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string; // YYYY-MM-DD
  lastWorkoutDayOfWeek: number; // 0 = Sun, 6 = Sat
  workedOutSaturday: boolean;
  workedOutSunday: boolean;
  totalWorkouts: number;
  totalSeconds: number;
  totalIntervals: number;
  totalShares: number;
  sharedViaSms: boolean;
  sharedViaEmailOrLink: boolean;
  importedSharedWorkouts: number;
  totalCorrectiveWorkouts: number;
  totalCorrectiveIntervals: number;
  totalSearches: number;
  exploredBodyParts: string[];
  inspectedExerciseIds: string[];
  unlockedBadgeIds: string[];
}
