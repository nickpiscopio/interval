import AsyncStorage from "@react-native-async-storage/async-storage";

export const VOICE_CONTROL_ENABLED_KEY = "@interval_voice_control_enabled";
export const VOICE_CONTROL_COOLDOWN_MS = 500;

export type VoiceCommand = "play" | "pause";

export interface VoiceCommandMatch {
  command: VoiceCommand;
  endIndex: number;
}

interface LocalizedPhraseSet {
  play: readonly string[];
  pause: readonly string[];
}

interface LocaleVoiceConfig {
  recognitionLocale: string;
  phrases: LocalizedPhraseSet;
}

const ENGLISH_PHRASES: LocalizedPhraseSet = {
  play: ["play timer", "play workout", "resume timer", "resume workout"],
  pause: ["pause timer", "pause workout"],
};

const SPANISH_PHRASES: LocalizedPhraseSet = {
  play: [
    "iniciar temporizador",
    "iniciar entrenamiento",
    "reanudar temporizador",
    "reanudar entrenamiento",
    "reproducir temporizador",
    "reproducir entrenamiento",
  ],
  pause: [
    "pausar temporizador",
    "pausar entrenamiento",
    "pausa temporizador",
    "pausa entrenamiento",
  ],
};

const FRENCH_PHRASES: LocalizedPhraseSet = {
  play: [
    "démarrer minuteur",
    "démarrer entraînement",
    "reprendre minuteur",
    "reprendre entraînement",
    "lancer minuteur",
    "lancer entraînement",
  ],
  pause: [
    "pause minuteur",
    "pause entraînement",
    "mettre en pause minuteur",
    "mettre en pause entraînement",
  ],
};

const LOCALE_VOICE_CONFIG: Record<string, LocaleVoiceConfig> = {
  en: {
    recognitionLocale: "en-US",
    phrases: ENGLISH_PHRASES,
  },
  es: {
    recognitionLocale: "es-ES",
    phrases: {
      play: [...SPANISH_PHRASES.play, ...ENGLISH_PHRASES.play],
      pause: [...SPANISH_PHRASES.pause, ...ENGLISH_PHRASES.pause],
    },
  },
  fr: {
    recognitionLocale: "fr-FR",
    phrases: {
      play: [...FRENCH_PHRASES.play, ...ENGLISH_PHRASES.play],
      pause: [...FRENCH_PHRASES.pause, ...ENGLISH_PHRASES.pause],
    },
  },
};

function getLocalePrefix(locale: string): string {
  return (locale || "en").toLowerCase().split(/[-_]/)[0];
}

function getLocaleVoiceConfig(locale: string): LocaleVoiceConfig {
  return LOCALE_VOICE_CONFIG[getLocalePrefix(locale)] ?? LOCALE_VOICE_CONFIG.en;
}

export function getSpeechRecognitionLocale(locale: string): string {
  return getLocaleVoiceConfig(locale).recognitionLocale;
}

export function normalizeVoiceTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findLatestVoiceCommand(
  transcript: string,
  locale: string,
  fromIndex = 0
): VoiceCommandMatch | null {
  const normalized = normalizeVoiceTranscript(transcript);
  if (!normalized) return null;

  const minIndex = Math.max(0, fromIndex);
  if (minIndex >= normalized.length) return null;

  const padded = ` ${normalized} `;
  const { phrases } = getLocaleVoiceConfig(locale);

  const commandEntries: ReadonlyArray<[VoiceCommand, readonly string[]]> = [
    ["play", phrases.play],
    ["pause", phrases.pause],
  ];

  let latestMatch: VoiceCommandMatch | null = null;
  let latestStartIndex = -1;

  for (const [command, phraseList] of commandEntries) {
    for (const phrase of phraseList) {
      const idx = padded.lastIndexOf(` ${phrase} `);
      if (idx >= minIndex && idx > latestStartIndex) {
        latestStartIndex = idx;
        latestMatch = { command, endIndex: idx + phrase.length };
      }
    }
  }

  return latestMatch;
}

export function matchVoiceCommand(
  transcript: string,
  locale: string
): VoiceCommand | null {
  return findLatestVoiceCommand(transcript, locale)?.command ?? null;
}

export async function getVoiceControlEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setVoiceControlEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      VOICE_CONTROL_ENABLED_KEY,
      enabled ? "true" : "false"
    );
  } catch {
    // Ignore storage write errors
  }
}
