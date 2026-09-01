import { t } from "../i18n";

export interface MotivationalMessageParams {
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  durationSeconds: number;
  rounds: number;
  seed?: number; // Optional seed for deterministic testing / random selection
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Generates an inspiring, whimsical completion message factoring in
 * day of the week, workout duration, and total rounds finished.
 */
export function getMotivationalCompletionMessage(params: MotivationalMessageParams): string {
  const {
    dayOfWeek = new Date().getDay(),
    durationSeconds,
    rounds,
    seed = Math.floor(Math.random() * 100),
  } = params;

  const formattedDuration = formatDuration(durationSeconds);
  const variantIndex = (seed % 2) + 1; // 1 or 2
  const variantKey = `v${variantIndex}`;

  const templateOptions = {
    rounds,
    duration: formattedDuration,
  };

  // 1. High Endurance Workout (15 minutes or longer)
  if (durationSeconds >= 900 && seed % 3 === 0) {
    return t(`completion.motivations.endurance.${variantKey}`, templateOptions);
  }

  // 2. High Round Volume (5 rounds or more)
  if (rounds >= 5 && seed % 3 === 1) {
    return t(`completion.motivations.highRounds.${variantKey}`, templateOptions);
  }

  // 3. Quick Lightning Sprint (< 5 minutes)
  if (durationSeconds < 300 && durationSeconds > 0 && seed % 3 === 2) {
    return t(`completion.motivations.quickSprint.${variantKey}`, templateOptions);
  }

  // 4. Day of the Week Motivations (Default / Primary Context)
  const dayKeys: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };

  const dayKey = dayKeys[dayOfWeek] || "monday";
  return t(`completion.motivations.${dayKey}.${variantKey}`, templateOptions);
}
