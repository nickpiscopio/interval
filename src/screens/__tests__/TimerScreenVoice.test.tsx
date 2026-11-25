import React from "react";
import { AppState, Linking, StyleSheet } from "react-native";
import { render, fireEvent, act, within } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer } from "expo-audio";
import { deactivateKeepAwake } from "expo-keep-awake";
import { logEvent as firebaseLogEvent } from "@react-native-firebase/analytics";
import {
  recordError as firebaseRecordError,
  setAttribute as firebaseSetAttribute,
} from "@react-native-firebase/crashlytics";
import TimerScreen from "../TimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";
import Spacing from "../../constants/Spacing";
import Colors from "../../constants/Colors";
import { setLocale } from "../../i18n";
import {
  VOICE_CONTROL_COOLDOWN_MS,
  VOICE_CONTROL_ENABLED_KEY,
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

    const { getByTestId, getByText, queryByTestId } = renderTimerScreen();
    await flushMicrotasks();

    const toggle = getByTestId("timer-voice-toggle");
    expect(toggle).toBeTruthy();

    await act(async () => {
      fireEvent.press(toggle);
    });
    await act(async () => {
      fireEvent.press(getByText("Enable"));
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

  it("shows hot-phrase alert on every explicit toggle from OFF to ON, pausing timer and restoring prior state", async () => {
    const { getByTestId, getByText } = renderTimerScreen();
    await flushMicrotasks();

    // First toggle ON -> shows alert, pauses timer
    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    expect(getByText("Hands-Free Voice Control")).toBeTruthy();
    expect(getByText("play")).toBeTruthy();

    // Confirm Enable -> starts listening & resumes timer
    await act(async () => {
      fireEvent.press(getByText("Enable"));
    });
    await flushMicrotasks();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic")).toBeTruthy();
    expect(getByText("pause")).toBeTruthy();

    // Toggle OFF -> stops immediately without alert
    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    await flushMicrotasks();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();

    // Second toggle ON -> shows hot-phrase alert again and pauses timer
    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    expect(getByText("Hands-Free Voice Control")).toBeTruthy();
    expect(getByText("play")).toBeTruthy();

    // Cancel -> restores running state and stays OFF
    await act(async () => {
      fireEvent.press(getByText("Cancel"));
    });
    expect(getByText("pause")).toBeTruthy();
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic-off")).toBeTruthy();
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
    await act(async () => {
      fireEvent.press(getByText("Enable"));
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
    expect(getByText("pause")).toBeTruthy();
    openSettingsSpy.mockRestore();
  });

  it("auto-starts listening silently on mount without showing alert when persisted ON across sessions", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");

    const { getByTestId, queryByText, queryByTestId } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);
    expect(within(getByTestId("timer-voice-toggle")).getByText("mic")).toBeTruthy();
    expect(queryByText("Hands-Free Voice Control")).toBeNull();
    expect(queryByTestId("custom-alert-backdrop")).toBeNull();
  });

  it("handles Play/Resume & Pause phrases, stays active while paused, enforces idempotency, cooldown, and ignores single words", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");

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

  it("shows Paused alert with tap-only copy when Voice Control is off, supports X dismissal while staying paused, and resumes with audio on Resume button", async () => {
    const { getByTestId, getByText, queryByText } = renderTimerScreen();
    await flushMicrotasks();

    const initialCalls = (createAudioPlayer as jest.Mock).mock.calls.length;

    // Press pause button -> plays pause sound and shows Paused alert (tap-only copy)
    fireEvent.press(getByTestId("timer-play-pause-button"));
    await flushMicrotasks();

    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(initialCalls + 1);
    expect(getByText("Timer Paused")).toBeTruthy();
    expect(getByText("Tap Resume to continue your workout.")).toBeTruthy();
    expect(getByTestId("icon-pause-circle-outline")).toBeTruthy();
    expect(getByTestId("custom-alert-close-button")).toBeTruthy();

    // Dismiss via upper-right X -> alert closes, timer stays paused, no extra sound
    fireEvent.press(getByTestId("custom-alert-close-button"));
    await flushMicrotasks();

    expect(queryByText("Timer Paused")).toBeNull();
    expect(within(getByTestId("timer-play-pause-button")).getByText("play")).toBeTruthy();
    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(initialCalls + 1);

    // Resume via play button, pause again, dismiss via backdrop while staying paused
    fireEvent.press(getByTestId("timer-play-pause-button"));
    await flushMicrotasks();
    expect(within(getByTestId("timer-play-pause-button")).getByText("pause")).toBeTruthy();

    fireEvent.press(getByTestId("timer-play-pause-button"));
    await flushMicrotasks();
    expect(getByText("Timer Paused")).toBeTruthy();

    fireEvent.press(getByTestId("custom-alert-backdrop"));
    await flushMicrotasks();
    expect(queryByText("Timer Paused")).toBeNull();
    expect(within(getByTestId("timer-play-pause-button")).getByText("play")).toBeTruthy();

    // Resume via play button, then pause again and resume via alert Resume button
    fireEvent.press(getByTestId("timer-play-pause-button"));
    await flushMicrotasks();
    fireEvent.press(getByTestId("timer-play-pause-button"));
    await flushMicrotasks();
    expect(getByText("Timer Paused")).toBeTruthy();

    const beforeResumeCalls = (createAudioPlayer as jest.Mock).mock.calls.length;
    fireEvent.press(getByText("Resume"));
    await flushMicrotasks();

    expect(queryByText("Timer Paused")).toBeNull();
    expect(within(getByTestId("timer-play-pause-button")).getByText("pause")).toBeTruthy();
    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(beforeResumeCalls + 1);
  });

  it("shows Paused alert with voice resume hint on verbal pause, keeps Voice Control listening, and auto-dismisses on verbal resume", async () => {
    await AsyncStorage.setItem(VOICE_CONTROL_ENABLED_KEY, "true");
    const { getByTestId, getByText, queryByText } = renderTimerScreen();
    await flushMicrotasks();

    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);
    const beforeVoicePauseCalls = (createAudioPlayer as jest.Mock).mock.calls.length;

    // Verbal pause -> plays pause sound, shows Paused alert with voice hint, keeps listening
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "Pause timer" }],
      });
    });
    await flushMicrotasks();

    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(beforeVoicePauseCalls + 1);
    expect(getByText("Timer Paused")).toBeTruthy();
    expect(
      getByText('Tap Resume or say "Play timer" or "Resume timer" to continue your workout.')
    ).toBeTruthy();
    expect(ExpoSpeechRecognitionModule.abort).not.toHaveBeenCalled();

    // Advance past voice cooldown and verbally resume -> auto-dismisses Paused alert and resumes
    act(() => {
      jest.advanceTimersByTime(VOICE_CONTROL_COOLDOWN_MS + 100);
    });
    const beforeVoiceResumeCalls = (createAudioPlayer as jest.Mock).mock.calls.length;
    act(() => {
      __emitSpeechRecognitionEvent("result", {
        results: [{ transcript: "Resume timer" }],
      });
    });
    await flushMicrotasks();

    expect(queryByText("Timer Paused")).toBeNull();
    expect(within(getByTestId("timer-play-pause-button")).getByText("pause")).toBeTruthy();
    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(beforeVoiceResumeCalls + 1);
  });

  it("auto-pauses with pause audio when AppState leaves active and shows Paused alert on return without clobbering Exit alert", async () => {
    const appStateHandlers: Array<(state: any) => void> = [];
    const addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, handler) => {
        appStateHandlers.push(handler as any);
        return { remove: jest.fn() } as any;
      });
    const emitAppState = (state: string) => {
      appStateHandlers.forEach((h) => h(state));
    };

    const { getByTestId, getByText, queryByText } = renderTimerScreen();
    await flushMicrotasks();

    const initialCalls = (createAudioPlayer as jest.Mock).mock.calls.length;

    // Device goes to sleep / background while running -> auto-pauses, releases wake lock, plays pause sound
    act(() => {
      emitAppState("inactive");
    });
    await flushMicrotasks();

    expect(within(getByTestId("timer-play-pause-button")).getByText("play")).toBeTruthy();
    expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");
    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(initialCalls + 1);
    expect(queryByText("Timer Paused")).toBeNull();

    // Subsequent background transition while already paused -> does NOT replay pause sound
    act(() => {
      emitAppState("background");
    });
    await flushMicrotasks();
    expect((createAudioPlayer as jest.Mock).mock.calls.length).toBe(initialCalls + 1);

    // Return to active foreground while paused -> shows Paused alert
    act(() => {
      emitAppState("active");
    });
    await flushMicrotasks();
    expect(getByText("Timer Paused")).toBeTruthy();

    // Dismiss Paused alert, open Exit alert, background and return -> Exit alert must NOT be clobbered
    fireEvent.press(getByTestId("custom-alert-close-button"));
    await flushMicrotasks();
    fireEvent.press(getByTestId("timer-back-button"));
    await flushMicrotasks();
    expect(getByText("Leave Workout?")).toBeTruthy();

    act(() => {
      emitAppState("background");
      emitAppState("active");
    });
    await flushMicrotasks();
    expect(getByText("Leave Workout?")).toBeTruthy();
    expect(queryByText("Timer Paused")).toBeNull();

    // Cancel Exit alert, open Voice Explainer alert, background and return -> Explainer must NOT be clobbered
    fireEvent.press(getByText("Keep Going"));
    await flushMicrotasks();
    await act(async () => {
      fireEvent.press(getByTestId("timer-voice-toggle"));
    });
    await flushMicrotasks();
    expect(getByText("Hands-Free Voice Control")).toBeTruthy();

    act(() => {
      emitAppState("background");
      emitAppState("active");
    });
    await flushMicrotasks();
    expect(getByText("Hands-Free Voice Control")).toBeTruthy();
    expect(queryByText("Timer Paused")).toBeNull();

    addEventListenerSpy.mockRestore();
  });

  it("emits voice_control_toggled, voice_command_triggered, updates Crashlytics attribute, and filters speech errors", async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    try {
      const { getByTestId, getByText } = renderTimerScreen();
      await flushMicrotasks();

      // Enable voice control
      await act(async () => {
        fireEvent.press(getByTestId("timer-voice-toggle"));
      });
      await flushMicrotasks();

      await act(async () => {
        fireEvent.press(getByText("Enable"));
      });
      await flushMicrotasks();

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "voice_control_toggled",
        { enabled: true }
      );
      expect(firebaseSetAttribute).toHaveBeenCalledWith(
        expect.anything(),
        "voice_control_enabled",
        "true"
      );

      // Trigger pause voice command
      act(() => {
        __emitSpeechRecognitionEvent("result", {
          results: [{ transcript: "pause timer" }],
        });
      });
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "voice_command_triggered",
        { command: "pause" }
      );

      // Advance past cooldown and trigger play voice command
      act(() => {
        jest.advanceTimersByTime(VOICE_CONTROL_COOLDOWN_MS + 100);
        __emitSpeechRecognitionEvent("result", {
          results: [{ transcript: "play timer" }],
        });
      });
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "voice_command_triggered",
        { command: "play" }
      );

      // Recoverable & permission speech errors must NOT record Crashlytics non-fatal
      jest.clearAllMocks();
      act(() => {
        __emitSpeechRecognitionEvent("error", { error: "no-speech" });
        __emitSpeechRecognitionEvent("error", { error: "speech-timeout" });
      });
      expect(firebaseRecordError).not.toHaveBeenCalled();

      // Unexpected speech error MUST record Crashlytics non-fatal
      act(() => {
        __emitSpeechRecognitionEvent("error", {
          error: "audio-capture",
          message: "mic hardware error",
        });
      });
      expect(firebaseRecordError).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ message: "mic hardware error" }),
        "speech.error.audio-capture"
      );

      // Disable voice control
      await act(async () => {
        fireEvent.press(getByTestId("timer-voice-toggle"));
      });
      await flushMicrotasks();

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "voice_control_toggled",
        { enabled: false }
      );
      expect(firebaseSetAttribute).toHaveBeenCalledWith(
        expect.anything(),
        "voice_control_enabled",
        "false"
      );
    } finally {
      (global as any).__DEV__ = originalDev;
    }
  });
});
