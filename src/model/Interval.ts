export interface Interval {
  color: string;
  name: string;
  duration: number; // in seconds
  exerciseId?: string;
  durationLeftInMillis?: number;
  totalDuration?: number;
}
