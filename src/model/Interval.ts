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
    sound: interval.sound,
    durationLeftInMillis: interval.durationLeftInMillis,
    totalDuration: interval.totalDuration,
  };
}
