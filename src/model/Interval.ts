export interface Interval {
  id: string;
  color: string;
  name: string;
  duration: number; // in seconds
  exerciseId?: string;
  sound?: string; // Interval Sound catalog ID; absent means default beep
  durationLeftInMillis?: number;
  totalDuration?: number;
}

export const INTERVAL_COLORS = {
  green: "#1ACC6C",
  emerald: "#10B981",
  blue: "#3B82F6",
  purple: "#8338EC",
  red: "#E63946",
  orange: "#F95738",
  yellow: "#F9C74F",
} as const;

export const INTERVAL_COLOR_PALETTE = [
  INTERVAL_COLORS.green,
  INTERVAL_COLORS.emerald,
  INTERVAL_COLORS.blue,
  INTERVAL_COLORS.purple,
  INTERVAL_COLORS.red,
  INTERVAL_COLORS.orange,
  INTERVAL_COLORS.yellow,
] as const;

const DEFAULT_INTERVAL_COLOR = INTERVAL_COLORS.green;

const APPROVED_COLOR_SET = new Set<string>(INTERVAL_COLOR_PALETTE);

const LEGACY_COLOR_REMAP: Record<string, string> = {
  "#4B5563": INTERVAL_COLORS.blue,
  "#6B7280": INTERVAL_COLORS.blue,
  "#F59E0B": INTERVAL_COLORS.yellow,
  "#059669": INTERVAL_COLORS.emerald,
};

export function normalizeIntervalColor(color?: string): string {
  if (!color) {
    return DEFAULT_INTERVAL_COLOR;
  }
  const normalized = color.trim().toUpperCase();
  if (APPROVED_COLOR_SET.has(normalized)) {
    return normalized;
  }
  if (normalized in LEGACY_COLOR_REMAP) {
    return LEGACY_COLOR_REMAP[normalized];
  }
  return DEFAULT_INTERVAL_COLOR;
}

export function generateIntervalId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function normalizeInterval(
  interval: Partial<Interval> & { color: string; name: string; duration: number },
  fallbackIndex = 0
): Interval {
  return {
    id: interval.id || `int_${Date.now()}_${fallbackIndex}_${Math.random().toString(36).substring(2, 7)}`,
    color: normalizeIntervalColor(interval.color),
    name: interval.name,
    duration: interval.duration,
    exerciseId: interval.exerciseId,
    sound: interval.sound,
    durationLeftInMillis: interval.durationLeftInMillis,
    totalDuration: interval.totalDuration,
  };
}
