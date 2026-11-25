import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import type {
  ExpoSpeechRecognitionModule as ExpoSpeechRecognitionModuleType,
  useSpeechRecognitionEvent as UseSpeechRecognitionEventType,
} from "expo-speech-recognition";
import { AlertOptions } from "../components/CustomAlertModal";

let ExpoSpeechRecognitionModule: typeof ExpoSpeechRecognitionModuleType | null = null;
let useSpeechRecognitionEvent: typeof UseSpeechRecognitionEventType = () => {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const speechRecognition = require("expo-speech-recognition") as {
    ExpoSpeechRecognitionModule?: typeof ExpoSpeechRecognitionModuleType;
    useSpeechRecognitionEvent?: typeof UseSpeechRecognitionEventType;
  };
  ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule ?? null;
  if (typeof speechRecognition.useSpeechRecognitionEvent === "function") {
    useSpeechRecognitionEvent = speechRecognition.useSpeechRecognitionEvent;
  }
} catch {
  // Native module unavailable (e.g. Expo Go or unbuilt native binary); hide mic gracefully.
  ExpoSpeechRecognitionModule = null;
}
import { getLocale, t } from "../i18n";
import {
  VOICE_CONTROL_COOLDOWN_MS,
  findLatestVoiceCommand,
  getSpeechRecognitionLocale,
  getVoiceControlEnabled,
  normalizeVoiceTranscript,
  setVoiceControlEnabled,
} from "../services/voiceControl";
import { logEvent } from "../services/analyticsService";
import {
  recordNonFatalError,
  setTelemetryAttribute,
} from "../services/crashlyticsService";

export interface UseTimerVoiceControlParams {
  isPausedRef: React.MutableRefObject<boolean>;
  onVoicePlay: () => void;
  onVoicePause: () => void;
  pauseForModal: () => boolean;
  restoreAfterModal: (wasPaused: boolean) => void;
  showAlert: (options: AlertOptions) => void;
}

export interface UseTimerVoiceControlResult {
  isAvailable: boolean;
  isEnabled: boolean;
  isListening: boolean;
  toggleVoiceControl: () => Promise<void>;
  pauseRecognitionForAlert: () => void;
  resumeRecognitionAfterAlert: () => void;
  stopVoiceControlForExit: () => void;
}

const RECOVERABLE_ERRORS = new Set(["no-speech", "speech-timeout"]);
const PERMISSION_ERRORS = new Set(["not-allowed", "service-not-allowed"]);

function isForegroundAppState(state: string | null | undefined): boolean {
  return state !== "background" && state !== "inactive";
}

function checkSpeechCapability(
  check: (mod: typeof ExpoSpeechRecognitionModuleType) => boolean
): boolean {
  if (!ExpoSpeechRecognitionModule) return false;
  try {
    return Boolean(check(ExpoSpeechRecognitionModule));
  } catch {
    return false;
  }
}

export function useTimerVoiceControl({
  isPausedRef,
  onVoicePlay,
  onVoicePause,
  pauseForModal,
  restoreAfterModal,
  showAlert,
}: UseTimerVoiceControlParams): UseTimerVoiceControlResult {
  const [isAvailable] = useState<boolean>(() =>
    checkSpeechCapability((mod) => mod.isRecognitionAvailable())
  );

  const [supportsOnDevice] = useState<boolean>(() =>
    checkSpeechCapability((mod) => mod.supportsOnDeviceRecognition())
  );

  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const isMountedRef = useRef(true);
  const isExitedRef = useRef(false);
  const isEnabledRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const isAlertOpenRef = useRef(false);
  const isTogglingRef = useRef(false);
  const appStateRef = useRef<string | null | undefined>(AppState.currentState);
  const lastCommandTimestampRef = useRef(0);
  const consumedTranscriptIndexRef = useRef(0);
  const consumedTranscriptPrefixRef = useRef("");

  const resetConsumedTranscript = useCallback(() => {
    consumedTranscriptIndexRef.current = 0;
    consumedTranscriptPrefixRef.current = "";
  }, []);

  const callbacksRef = useRef({
    onVoicePlay,
    onVoicePause,
    pauseForModal,
    restoreAfterModal,
    showAlert,
  });
  callbacksRef.current = {
    onVoicePlay,
    onVoicePause,
    pauseForModal,
    restoreAfterModal,
    showAlert,
  };

  const canRecognize = useCallback(() => {
    return (
      isAvailable &&
      isMountedRef.current &&
      !isExitedRef.current &&
      isEnabledRef.current &&
      !isAlertOpenRef.current &&
      isForegroundAppState(appStateRef.current)
    );
  }, [isAvailable]);

  const startRecognition = useCallback(() => {
    if (!ExpoSpeechRecognitionModule || !canRecognize() || isRecognizingRef.current) return;

    try {
      ExpoSpeechRecognitionModule.start({
        lang: getSpeechRecognitionLocale(getLocale()),
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: supportsOnDevice,
      });
      isRecognizingRef.current = true;
      setIsListening(true);
    } catch (e) {
      recordNonFatalError(e, "speech.start");
      isRecognizingRef.current = false;
      setIsListening(false);
    }
  }, [canRecognize, supportsOnDevice]);

  const stopRecognition = useCallback(() => {
    const wasRecognizing = isRecognizingRef.current;
    isRecognizingRef.current = false;
    resetConsumedTranscript();
    setIsListening(false);
    if (wasRecognizing && ExpoSpeechRecognitionModule) {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // Ignore abort errors during cleanup
      }
    }
  }, [resetConsumedTranscript]);

  // Load persisted voice preference on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (!isAvailable) {
      return () => {
        isMountedRef.current = false;
      };
    }

    let cancelled = false;
    (async () => {
      const savedEnabled = await getVoiceControlEnabled();
      if (cancelled || !isMountedRef.current || isExitedRef.current) return;

      if (savedEnabled && ExpoSpeechRecognitionModule) {
        try {
          const perm = await ExpoSpeechRecognitionModule.getPermissionsAsync();
          if (cancelled || !isMountedRef.current || isExitedRef.current) return;
          if (perm?.granted) {
            isEnabledRef.current = true;
            setIsEnabled(true);
            void setTelemetryAttribute("voice_control_enabled", "true");
            startRecognition();
          } else {
            isEnabledRef.current = false;
            setIsEnabled(false);
            void setTelemetryAttribute("voice_control_enabled", "false");
            await setVoiceControlEnabled(false);
          }
        } catch {
          isEnabledRef.current = false;
          setIsEnabled(false);
          void setTelemetryAttribute("voice_control_enabled", "false");
        }
      } else {
        void setTelemetryAttribute("voice_control_enabled", "false");
      }
    })();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      stopRecognition();
    };
  }, [isAvailable, startRecognition, stopRecognition]);

  // Pause recognition when app leaves active foreground; resume on return
  useEffect(() => {
    if (!isAvailable) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      if (!isForegroundAppState(nextState)) {
        stopRecognition();
      } else {
        startRecognition();
      }
    });
    return () => {
      subscription?.remove?.();
    };
  }, [isAvailable, startRecognition, stopRecognition]);

  useSpeechRecognitionEvent("start", () => {
    resetConsumedTranscript();
    if (isMountedRef.current && isEnabledRef.current && !isExitedRef.current) {
      isRecognizingRef.current = true;
      setIsListening(true);
    }
  });

  useSpeechRecognitionEvent("result", (event: any) => {
    if (!canRecognize()) return;
    const transcript = event?.results?.[0]?.transcript;
    if (typeof transcript !== "string") return;

    const normalized = normalizeVoiceTranscript(transcript);
    if (!normalized) return;

    if (
      normalized.length < consumedTranscriptIndexRef.current ||
      !normalized.startsWith(consumedTranscriptPrefixRef.current)
    ) {
      resetConsumedTranscript();
    }

    const match = findLatestVoiceCommand(
      normalized,
      getLocale(),
      consumedTranscriptIndexRef.current
    );
    if (!match) return;

    consumedTranscriptIndexRef.current = match.endIndex;
    consumedTranscriptPrefixRef.current = normalized.slice(0, match.endIndex);

    // Idempotent transitions: only act if state actually changes
    if (match.command === "play" && !isPausedRef.current) return;
    if (match.command === "pause" && isPausedRef.current) return;

    const now = Date.now();
    if (now - lastCommandTimestampRef.current < VOICE_CONTROL_COOLDOWN_MS) {
      return;
    }
    lastCommandTimestampRef.current = now;
    void logEvent("voice_command_triggered", { command: match.command });

    if (match.command === "play") {
      callbacksRef.current.onVoicePlay();
    } else {
      callbacksRef.current.onVoicePause();
    }
  });

  useSpeechRecognitionEvent("end", () => {
    isRecognizingRef.current = false;
    resetConsumedTranscript();
    if (canRecognize()) {
      startRecognition();
    } else if (isMountedRef.current) {
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent("error", (event: any) => {
    const errorCode = event?.error;
    isRecognizingRef.current = false;

    if (PERMISSION_ERRORS.has(errorCode)) {
      isEnabledRef.current = false;
      if (isMountedRef.current) {
        setIsEnabled(false);
        setIsListening(false);
      }
      void setVoiceControlEnabled(false);
      void setTelemetryAttribute("voice_control_enabled", "false");
      return;
    }

    if (RECOVERABLE_ERRORS.has(errorCode)) {
      if (canRecognize()) {
        startRecognition();
      }
      return;
    }

    recordNonFatalError(
      new Error(event?.message || String(errorCode || "unknown_speech_error")),
      `speech.error.${String(errorCode || "unknown")}`
    );

    if (isMountedRef.current) {
      setIsListening(false);
    }
  });

  const completeEnable = useCallback(
    async (wasPaused: boolean) => {
      try {
        if (!ExpoSpeechRecognitionModule) return;
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!isMountedRef.current || isExitedRef.current) return;

        if (perm?.granted) {
          isEnabledRef.current = true;
          setIsEnabled(true);
          await setVoiceControlEnabled(true);
          void logEvent("voice_control_toggled", { enabled: true });
          void setTelemetryAttribute("voice_control_enabled", "true");
          callbacksRef.current.restoreAfterModal(wasPaused);
          startRecognition();
        } else {
          isEnabledRef.current = false;
          setIsEnabled(false);
          await setVoiceControlEnabled(false);
          isAlertOpenRef.current = true;
          const dismissPermissionAlert = () => {
            isAlertOpenRef.current = false;
            callbacksRef.current.restoreAfterModal(wasPaused);
          };
          callbacksRef.current.showAlert({
            title: t("timer.voicePermissionDeniedTitle"),
            message: t("timer.voicePermissionDeniedMessage"),
            icon: "warning",
            buttons: [
              {
                text: t("common.cancel"),
                style: "cancel",
                onPress: dismissPermissionAlert,
              },
              {
                text: t("timer.voiceOpenSettings"),
                style: "default",
                onPress: () => {
                  dismissPermissionAlert();
                  Linking.openSettings();
                },
              },
            ],
          });
        }
      } finally {
        isTogglingRef.current = false;
      }
    },
    [startRecognition]
  );

  const toggleVoiceControl = useCallback(async () => {
    if (!isAvailable || isTogglingRef.current) return;

    if (isEnabledRef.current) {
      isEnabledRef.current = false;
      setIsEnabled(false);
      stopRecognition();
      await setVoiceControlEnabled(false);
      void logEvent("voice_control_toggled", { enabled: false });
      void setTelemetryAttribute("voice_control_enabled", "false");
      return;
    }

    isTogglingRef.current = true;
    const wasPaused = callbacksRef.current.pauseForModal();
    isAlertOpenRef.current = true;
    stopRecognition();
    callbacksRef.current.showAlert({
      title: t("timer.voiceExplainerTitle"),
      message: t("timer.voiceExplainerMessage"),
      icon: "info",
      buttons: [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => {
            isAlertOpenRef.current = false;
            isTogglingRef.current = false;
            callbacksRef.current.restoreAfterModal(wasPaused);
          },
        },
        {
          text: t("timer.voiceExplainerEnable"),
          style: "default",
          onPress: () => {
            isAlertOpenRef.current = false;
            void completeEnable(wasPaused);
          },
        },
      ],
    });
  }, [completeEnable, isAvailable, stopRecognition]);

  const pauseRecognitionForAlert = useCallback(() => {
    isAlertOpenRef.current = true;
    stopRecognition();
  }, [stopRecognition]);

  const resumeRecognitionAfterAlert = useCallback(() => {
    isAlertOpenRef.current = false;
    startRecognition();
  }, [startRecognition]);

  const stopVoiceControlForExit = useCallback(() => {
    isExitedRef.current = true;
    stopRecognition();
  }, [stopRecognition]);

  return {
    isAvailable,
    isEnabled,
    isListening,
    toggleVoiceControl,
    pauseRecognitionForAlert,
    resumeRecognitionAfterAlert,
    stopVoiceControlForExit,
  };
}
