import { AudioSource } from "expo-audio";

/** Reserved sound ID meaning the interval begins silently. */
export const NONE_SOUND_ID = "none";
export const DEFAULT_SOUND_ID = "beep";

export interface IntervalSound {
  /** Stable ID. Persisted and shared in links: never rename or reuse (ADR-0048). */
  id: string;
  /** i18n key for the display name. */
  labelKey: string;
  source: AudioSource;
}

export const INTERVAL_SOUNDS: IntervalSound[] = [
  {
    id: "beep",
    labelKey: "createTimer.soundBeep",
    source: require("../../assets/sounds/beep.mp3"),
  },
  {
    id: "beep_2",
    labelKey: "createTimer.soundBeep2",
    source: require("../../assets/sounds/beep_2.mp3"),
  },
  {
    id: "beep_3",
    labelKey: "createTimer.soundBeep3",
    source: require("../../assets/sounds/beep_3.mp3"),
  },
];

/**
 * Resolve a sound ID to an audio source. Returns null for "none".
 * Missing or unknown IDs fall back to the default beep.
 */
export function resolveSoundSource(id?: string): AudioSource | null {
  if (id === NONE_SOUND_ID) return null;
  const found = INTERVAL_SOUNDS.find((s) => s.id === id);
  return (found ?? INTERVAL_SOUNDS.find((s) => s.id === DEFAULT_SOUND_ID)!).source;
}

/** Resolve an ID to the catalog ID that will actually play (or "none"). */
export function resolveSoundId(id?: string): string {
  if (id === NONE_SOUND_ID) return NONE_SOUND_ID;
  return INTERVAL_SOUNDS.some((s) => s.id === id) ? (id as string) : DEFAULT_SOUND_ID;
}
