export interface Badge {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  tagline: string;
  description: string;
  category: "streak" | "volume" | "feat" | "timing";
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
  unlockedBadgeIds: string[];
}
