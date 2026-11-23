import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  VOICE_CONTROL_ENABLED_KEY,
  VOICE_CONTROL_COOLDOWN_MS,
  findLatestVoiceCommand,
  getSpeechRecognitionLocale,
  matchVoiceCommand,
  getVoiceControlEnabled,
  setVoiceControlEnabled,
} from "../voiceControl";

describe("voiceControl service", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe("constants", () => {
    it("exports expected storage key and cooldown constants", () => {
      expect(VOICE_CONTROL_COOLDOWN_MS).toBe(500);
      expect(VOICE_CONTROL_ENABLED_KEY).toBeTruthy();
    });
  });

  describe("getSpeechRecognitionLocale", () => {
    it("maps supported app locales to BCP-47 speech recognition locales", () => {
      expect(getSpeechRecognitionLocale("en")).toBe("en-US");
      expect(getSpeechRecognitionLocale("en-GB")).toBe("en-US");
      expect(getSpeechRecognitionLocale("es")).toBe("es-ES");
      expect(getSpeechRecognitionLocale("es-MX")).toBe("es-ES");
      expect(getSpeechRecognitionLocale("fr")).toBe("fr-FR");
      expect(getSpeechRecognitionLocale("fr-CA")).toBe("fr-FR");
      expect(getSpeechRecognitionLocale("de")).toBe("en-US");
      expect(getSpeechRecognitionLocale("")).toBe("en-US");
    });
  });

  describe("matchVoiceCommand", () => {
    it("matches all English Play/Resume and Pause phrases", () => {
      expect(matchVoiceCommand("play timer", "en")).toBe("play");
      expect(matchVoiceCommand("play workout", "en")).toBe("play");
      expect(matchVoiceCommand("resume timer", "en")).toBe("play");
      expect(matchVoiceCommand("resume workout", "en")).toBe("play");

      expect(matchVoiceCommand("pause timer", "en")).toBe("pause");
      expect(matchVoiceCommand("pause workout", "en")).toBe("pause");
    });

    it("matches all Spanish Play/Resume and Pause phrases plus English fallbacks", () => {
      expect(matchVoiceCommand("iniciar temporizador", "es")).toBe("play");
      expect(matchVoiceCommand("iniciar entrenamiento", "es")).toBe("play");
      expect(matchVoiceCommand("reanudar temporizador", "es")).toBe("play");
      expect(matchVoiceCommand("reanudar entrenamiento", "es")).toBe("play");
      expect(matchVoiceCommand("reproducir temporizador", "es")).toBe("play");
      expect(matchVoiceCommand("reproducir entrenamiento", "es")).toBe("play");

      expect(matchVoiceCommand("pausar temporizador", "es")).toBe("pause");
      expect(matchVoiceCommand("pausar entrenamiento", "es")).toBe("pause");
      expect(matchVoiceCommand("pausa temporizador", "es")).toBe("pause");
      expect(matchVoiceCommand("pausa entrenamiento", "es")).toBe("pause");

      // English fallback in Spanish locale
      expect(matchVoiceCommand("play timer", "es")).toBe("play");
      expect(matchVoiceCommand("pause workout", "es")).toBe("pause");
    });

    it("matches all French Play/Resume and Pause phrases plus English fallbacks", () => {
      expect(matchVoiceCommand("démarrer minuteur", "fr")).toBe("play");
      expect(matchVoiceCommand("démarrer entraînement", "fr")).toBe("play");
      expect(matchVoiceCommand("reprendre minuteur", "fr")).toBe("play");
      expect(matchVoiceCommand("reprendre entraînement", "fr")).toBe("play");
      expect(matchVoiceCommand("lancer minuteur", "fr")).toBe("play");
      expect(matchVoiceCommand("lancer entraînement", "fr")).toBe("play");

      expect(matchVoiceCommand("pause minuteur", "fr")).toBe("pause");
      expect(matchVoiceCommand("pause entraînement", "fr")).toBe("pause");
      expect(matchVoiceCommand("mettre en pause minuteur", "fr")).toBe("pause");
      expect(matchVoiceCommand("mettre en pause entraînement", "fr")).toBe("pause");

      // English fallback in French locale
      expect(matchVoiceCommand("resume workout", "fr")).toBe("play");
      expect(matchVoiceCommand("pause timer", "fr")).toBe("pause");
    });

    it("handles case insensitivity, punctuation, accented characters, and extra whitespace", () => {
      expect(matchVoiceCommand("  PAUSE,   TIMER!! ", "en")).toBe("pause");
      expect(matchVoiceCommand("Hey, please Resume Workout now.", "en")).toBe("play");
      expect(matchVoiceCommand("DÉMARRER   ENTRAÎNEMENT!", "fr")).toBe("play");
      expect(matchVoiceCommand("¡Pausar temporizador!", "es")).toBe("pause");
    });

    it("ignores isolated single words and partial word matches", () => {
      expect(matchVoiceCommand("play", "en")).toBeNull();
      expect(matchVoiceCommand("pause", "en")).toBeNull();
      expect(matchVoiceCommand("start", "en")).toBeNull();
      expect(matchVoiceCommand("stop", "en")).toBeNull();
      expect(matchVoiceCommand("resume", "en")).toBeNull();
      expect(matchVoiceCommand("timer", "en")).toBeNull();
      expect(matchVoiceCommand("workout", "en")).toBeNull();
      expect(matchVoiceCommand("replaying timer", "en")).toBeNull();
      expect(matchVoiceCommand("paused timers", "en")).toBeNull();
      expect(matchVoiceCommand("   ", "en")).toBeNull();
    });

    it("picks the most recent command when multiple commands appear in a continuous transcript", () => {
      expect(matchVoiceCommand("pause timer okay now play timer", "en")).toBe("play");
      expect(matchVoiceCommand("play workout actually pause workout", "en")).toBe("pause");
    });
  });

  describe("findLatestVoiceCommand", () => {
    it("returns command and endIndex and ignores previously consumed phrases via fromIndex", () => {
      const first = findLatestVoiceCommand("pause timer", "en", 0);
      expect(first).toEqual({ command: "pause", endIndex: "pause timer".length });

      // Subsequent continuous transcript with trailing unrelated words does not re-trigger
      expect(
        findLatestVoiceCommand("pause timer and keep going", "en", first!.endIndex)
      ).toBeNull();

      // A new command appended after fromIndex does trigger and advances endIndex
      const nextTranscript = "pause timer and keep going resume workout";
      const second = findLatestVoiceCommand(nextTranscript, "en", first!.endIndex);
      expect(second).toEqual({
        command: "play",
        endIndex: nextTranscript.length,
      });

      // fromIndex at or beyond transcript length returns null
      expect(findLatestVoiceCommand(nextTranscript, "en", second!.endIndex)).toBeNull();
    });
  });

  describe("storage helpers", () => {
    it("defaults enabled to false and persists true/false", async () => {
      expect(await getVoiceControlEnabled()).toBe(false);

      await setVoiceControlEnabled(true);
      expect(await getVoiceControlEnabled()).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(VOICE_CONTROL_ENABLED_KEY, "true");

      await setVoiceControlEnabled(false);
      expect(await getVoiceControlEnabled()).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(VOICE_CONTROL_ENABLED_KEY, "false");
    });

    it("handles AsyncStorage errors gracefully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("read fail"));
      expect(await getVoiceControlEnabled()).toBe(false);

      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error("write fail"));
      await expect(setVoiceControlEnabled(true)).resolves.toBeUndefined();
    });
  });
});
