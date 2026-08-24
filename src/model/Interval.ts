export interface Interval {
  id: string;
  color: string;
  name: string;
  duration: number; // in seconds
  exerciseId?: string;
  durationLeftInMillis?: number;
  totalDuration?: number;
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
    color: interval.color,
    name: interval.name,
    duration: interval.duration,
    exerciseId: interval.exerciseId,
    durationLeftInMillis: interval.durationLeftInMillis,
    totalDuration: interval.totalDuration,
  };
}
