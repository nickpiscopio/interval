import React from "react";
import { AppState, Linking, StyleSheet } from "react-native";
import { render, fireEvent, act, within } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TimerScreen from "../TimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";
import Spacing from "../../constants/Spacing";
import Colors from "../../constants/Colors";
import { setLocale } from "../../i18n";
import {
  VOICE_CONTROL_COOLDOWN_MS,
  VOICE_CONTROL_ENABLED_KEY,
  VOICE_CONTROL_EXPLAINER_VERSION,
  VOICE_CONTROL_EXPLAINER_VERSION_KEY,
} from "../../services/voiceControl";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SpeechRecognition = require("expo-speech-recognition");
const {
  ExpoSpeechRecognitionModule,
  __emitSpeechRecognitionEvent,
  __resetSpeechRecognitionMock,
} = SpeechRecognition;

describe("TimerScreen Voice Control", () => {
  const mockTimer: Timer = {
    id: "timer-voice-1",
    name: "Voice HIIT",
    rounds: 1,
    intervals: [
      { id: "i1", name: "Plank", duration: 10, color: "#10B981" },
      { id: "i2", name: "Rest", duration: 5, color: "#3B82F6" },
    ],
  };

  let mockNavigation: any;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    __resetSpeechRecognitionMock();
    await AsyncStorage.clear();
    setLocale("en");
    mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderTimerScreen() {
    return render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );
  }

  async function flushMicrotasks() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("hides the mic toggle completely when speech recognition is unavailable", () => {
    ExpoSpeechRecognitionModule.isRecognitionAvailable.mockReturnValue(false);

    const { queryByTestId } = renderTimerScreen();
    expect(queryByTestId("timer-voice-toggle")).toBeNull();
    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();
  });

  it("shows the mic toggle and falls back to standard recognition when on-device recognition is unsupported", async () => {
    let appStateHandler: ((state: any) => void) | undefined;
    const addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, handler) => {
        appStateHandler = handler as any;
        return { remove: jest.fn() } as any;
      });

    ExpoSpeechRecognitionModule.isRecognitionAvailable.mockReturnValue(true);
    ExpoSpeechRecognitionModule.supportsOnDeviceRecognition.mockReturnValue(false);
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByTestId, getByText, queryByTestId } = renderTimerScreen();
    await flushMicrotasks();

    const toggle = getByTestId("timer-voice-toggle");
    expect(toggle).toBeTruthy();

    await act(async () => {
      fireEvent.press(toggle);
    });
    await flushMicrotasks();

    const expectedFallbackStartOptions = {
      lang: "en-US",
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: false,
    };
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith(expectedFallbackStartOptions);
    expect(StyleSheet.flatten(getByTestId("timer-voice-toggle").props.style).backgroundColor).toBe(
      Colors.white
    );

    // Transient network error in fallback mode degrades silently without interrupting Timer or disabling preference
    act(() => {
      __emitSpeechRecognitionEvent("error", { error: "network" });
    });
    await flushMicrotasks();

    expect(within(getByTestId("timer-voice-toggle")).getByText("mic")).toBeTruthy();
    expect(
      StyleSheet.flatten(getByTestId("timer-voice-toggle").props.style).backgroundColor
    ).toBeUndefined();
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("true");
    expect(getByText("pause")).toBeTruthy();
    expect(queryByTestId("custom-alert-backdrop")).toBeNull();

    // Returning to active foreground retries recognition automatically
    act(() => {
      appStateHandler?.("background");
    });
    act(() => {
      appStateHandler?.("active");
    });
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(2);
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenLastCalledWith(
      expectedFallbackStartOptions
    );

    addEventListenerSpy.mockRestore();
  });

  it("renders updated localized onboarding explainer copy in Spanish and French", async () => {
    setLocale("es");
    const esScreen = renderTimerScreen();
    await flushMicrotasks();
    await act(async () => {
      fireEvent.press(esScreen.getByTestId("timer-voice-toggle"));
    });
    expect(esScreen.getByText(/reconocimiento de voz de tu dispositivo/)).toBeTruthy();
    esScreen.unmount();

    setLocale("fr");
    const frScreen = renderTimerScreen();
    await flushMicrotasks();
    await act(async () => {
      fireEvent.press(frScreen.getByTestId("timer-voice-toggle"));
    });
    expect(frScreen.getByText(/reconnaissance vocale de votre appareil/)).toBeTruthy();
    frScreen.unmount();
  });

  it("defaults to OFF with 44x44 touch target and mic-off icon", async () => {
    const { getByTestId } = renderTimerScreen();
    await flushMicrotasks();

    const toggle = getByTestId("timer-voice-toggle");
    const style = StyleSheet.flatten(toggle.props.style);
    expect(style.width).toBe(Spacing.touchTarget.icon);
    expect(style.height).toBe(Spacing.touchTarget.icon);
    expect(within(toggle).getByText("mic-off")).toBeTruthy();
    expect(toggle.props.accessibilityLabel).toBe("Enable voice control");
    expect(ExpoSpeechRecognitionModule.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();
  });

  it("shows explainer on first toggle ON, pauses timer, and restores prior pause state on cancel", async () => {
    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    // Timer is running
    expect(getByText("pause")).toBeTruthy();

    // Tap mic toggle -> pauses timer & shows explainer with hot phrases
    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });

    expect(getByText("play")).toBeTruthy();
    expect(getByText("Hands-Free Voice Control")).toBeTruthy();
    expect(getByText(/your device's speech recognition/)).toBeTruthy();
    expect(getByText(/Play timer/)).toBeTruthy();
    expect(getByText(/Pause workout/)).toBeTruthy();
    expect(ExpoSpeechRecognitionModule.requestPermissionsAsync).not.toHaveBeenCalled();

    // Cancel -> restores running state, keeps toggle OFF
    await act(async () => {
      fireEvent.press(getByText("Cancel"));
    });

    expect(getByText("pause")).toBeTruthy();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();
    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();

    // Pause manually, open explainer, cancel -> stays paused
    fireEvent.press(getByText("pause"));
    expect(getByText("play")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    await act(async () => {
      fireEvent.press(getByText("Cancel"));
    });
    expect(getByText("play")).toBeTruthy();
  });

  it("re-displays explainer when stored explainer version is outdated", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_EXPLAINER_VERSION_KEY, "0");

    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });

    expect(getByText("Hands-Free Voice Control")).toBeTruthy();
  });

  it("enables voice control after confirming explainer and granting permissions, and persists state", async () => {
    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });

    await act(async () => {
      fireEvent.press(getByText("Enable"));
    });
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith({
      lang: "en-US",
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: true,
    });

    // Visual active-listening state
    const toggle = getByTestId("timer-voice-toggle");
    expect(within(toggle).getByText("mic")).toBeTruthy();
    expect(toggle.props.accessibilityLabel).toBe("Disable voice control (listening)");
    expect(StyleSheet.flatten(toggle.props.style).backgroundColor).toBe(Colors.white);

    // Persisted preferences
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("true");
    expect(await AsyncStorage.getItem(VOICE_CONTROL_EXPLAINER_VERSION_KEY)).toBe(
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    // Timer resumed after explainer confirmation
    expect(getByText("pause")).toBeTruthy();

    // Toggling OFF stops recognition immediately without showing an alert
    await act(async () => {
      fireEvent.press(toggle);
    });
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(1);
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("false");
  });

  it("keeps toggle OFF and offers Open Settings alert when OS permissions are denied", async () => {
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );
    ExpoSpeechRecognitionModule.requestPermissionsAsync.mockResolvedValue({
      granted: false,
      status: "denied",
      canAskAgain: false,
      expires: "never",
    });
    const openSettingsSpy = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue(undefined);

    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("false");
    expect(getByText("Microphone Permission Needed")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText("Open Settings"));
    });
    expect(openSettingsSpy).toHaveBeenCalledTimes(1);
    openSettingsSpy.mockRestore();
  });

  it("auto-starts listening on mount when persisted ON across sessions", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByTestId } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic")).toBeTruthy();
  });

  it("handles Play/Resume & Pause phrases, stays active while paused, enforces idempotency, cooldown, and ignores single words", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByText } = renderTimerScreen();
    await flushMicrotasks();

    // Timer is running; isolated single word "pause" is ignored
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "pause" }],
        isFinal: false,
      });
    });
    expect(getByText("pause")).toBeTruthy();

    // "play timer" while already running is a no-op
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "play timer" }],
        isFinal: true,
      });
    });
    expect(getByText("pause")).toBeTruthy();

    // "pause timer" pauses the timer while keeping listening active
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "Pause timer" }],
        isFinal: true,
      });
    });
    expect(getByText("play")).toBeTruthy();
    expect(ExpoSpeechRecognitionModule.abort).not.toHaveBeenCalled();

    // Immediate "resume timer" within 500ms cooldown is ignored
    act(() => {
      jest.advanceTimersByTime(VOICE_CONTROL_COOLDOWN_MS - 100);
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "resume timer" }],
        isFinal: false,
      });
    });
    expect(getByText("play")).toBeTruthy();

    // After cooldown expires, "resume workout" resumes the timer
    act(() => {
      jest.advanceTimersByTime(200);
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "resume workout" }],
        isFinal: true,
      });
    });
    expect(getByText("pause")).toBeTruthy();
  });

  it("does not re-trigger an already-consumed phrase in a continuous transcript after manual Play", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    // Say "pause timer" -> timer pauses
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "pause timer" }],
        isFinal: false,
      });
    });
    expect(getByText("play")).toBeTruthy();

    // User manually taps Play -> timer resumes
    act(() => {
      fireEvent.press(getByTestId("timer-play-pause-button"));
    });
    expect(getByText("pause")).toBeTruthy();

    // Continuous transcript grows with unrelated words after cooldown -> stays running (no re-pause)
    act(() => {
      jest.advanceTimersByTime(VOICE_CONTROL_COOLDOWN_MS + 100);
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "pause timer and keep going" }],
        isFinal: false,
      });
    });
    expect(getByText("pause")).toBeTruthy();
  });

  it("supports localized Spanish and French phrases with English fallback", async () => {
    setLocale("es");
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByText } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith(
      expect.objectContaining({ lang: "es-ES" })
    );

    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "pausar entrenamiento" }],
        isFinal: true,
      });
    });
    expect(getByText("play")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(VOICE_CONTROL_COOLDOWN_MS + 50);
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "reanudar temporizador" }],
        isFinal: true,
      });
    });
    expect(getByText("pause")).toBeTruthy();
  });

  it("stops recognition during exit alert, backgrounding, completion, and unmount, and auto-restarts on OS end event", async () => {
    let appStateHandler: ((state: any) => void) | undefined;
    const addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, handler) => {
        appStateHandler = handler as any;
        return { remove: jest.fn() } as any;
      });

    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    const { getByTestId, getByText, unmount } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);

    // OS ends session due to silence/timeout -> auto-restarts
    act(() => {
      __emitSpeechRecognitionEvent("end", {});
    });
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(2);

    // Recoverable no-speech error -> auto-restarts
    act(() => {
      __emitSpeechRecognitionEvent("error", { error: "no-speech" });
    });
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(3);

    // Opening exit confirmation alert stops recognition; cancel resumes it
    fireEvent.press(getByTestId("timer-back-button"));
    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Keep Going"));
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(4);

    // App moves to background -> stops recognition; returns to active -> resumes
    act(() => {
      appStateHandler?.("background");
    });
    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(2);

    act(() => {
      appStateHandler?.("active");
    });
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(5);

    // Unmount stops recognition and never restarts on subsequent end events
    unmount();
    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(3);

    act(() => {
      __emitSpeechRecognitionEvent("end", {});
    });
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(5);

    addEventListenerSpy.mockRestore();
  });

  it("stops recognition when the workout finishes and navigates to Completion", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );

    renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);

    // Advance through 10s + 5s = 15s total
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(1);
    expect(mockNavigation.replace).toHaveBeenCalledWith(
      "Completion",
      expect.objectContaining({
        timer: mockTimer,
        qualifiesForCredit: true,
      })
    );
  });

  it("disables voice control if OS permission is revoked on mount or emits not-allowed error", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    await AsyncStorage.setItem(
      VOICE_CONTROL_EXPLAINER_VERSION_KEY,
      VOICE_CONTROL_EXPLAINER_VERSION
    );
    ExpoSpeechRecognitionModule.getPermissionsAsync.mockResolvedValueOnce({
      granted: false,
      status: "denied",
      canAskAgain: false,
      expires: "never",
    });

    const { getByTestId, unmount } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("false");
    unmount();

    // Now start enabled and emit not-allowed error
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    const second = renderTimerScreen();
    await flushMicrotasks();
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);

    act(() => {
      __emitSpeechRecognitionEvent("error", { error: "not-allowed" });
    });
    await flushMicrotasks();

    expect(
      within(second.getByTestId("timer-voice-toggle")).getByText("mic-off")
    ).toBeTruthy();
    expect(await AsyncStorage.getItem(VOICE_CONTROL_ENABLED_KEY)).toBe("false");
  });
});
