import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import TimerScreen from "../TimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";

// jest-expo maps every asset to the same stub, so give each sound a distinct source.
const BEEP = "beep-source";
const BEEP_3 = "beep3-source";
const PAUSE = "pause-source";
jest.mock("../../constants/Sounds", () => {
  const actual = jest.requireActual("../../constants/Sounds");
  const sources: Record<string, string> = { beep: "beep-source", beep_3: "beep3-source" };
  return {
    ...actual,
    PAUSE_SOUND_SOURCE: "pause-source",
    resolveSoundSource: (id?: string) =>
      id === "none" ? null : sources[id as string] ?? sources.beep,
  };
});

function playsFor(source: unknown): number {
  const mock = createAudioPlayer as jest.Mock;
  return mock.mock.calls.reduce(
    (sum, call, i) =>
      call[0] === source ? sum + mock.mock.results[i].value.play.mock.calls.length : sum,
    0
  );
}

function getPlayer(source: unknown): any {
  const mock = createAudioPlayer as jest.Mock;
  const index = mock.mock.calls.findIndex((call) => call[0] === source);
  return index >= 0 ? mock.mock.results[index].value : null;
}

function renderTimer(intervals: Timer["intervals"], rounds = 1, navOverrides: any = {}) {
  const timer: Timer = { id: "t", name: "T", rounds, intervals };
  const navigation: any = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    popToTop: jest.fn(),
    ...navOverrides,
  };
  const utils = render(
    <AlertProvider>
      <TimerScreen navigation={navigation} route={{ params: { timer } } as any} />
    </AlertProvider>
  );
  return { ...utils, navigation };
}

describe("TimerScreen interval sounds", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (createAudioPlayer as jest.Mock).mockClear();
    (setAudioModeAsync as jest.Mock).mockClear();
  });
  afterEach(() => jest.useRealTimers());

  async function flush() {
    await act(async () => {
      await Promise.resolve();
    });
  }

  it("plays the first interval's sound on start and the next on transition", async () => {
    renderTimer([
      { id: "a", name: "A", duration: 1, color: "#fff", sound: "beep_3" },
      { id: "b", name: "B", duration: 1, color: "#fff", sound: "beep" },
    ]);
    await flush();
    expect(playsFor(BEEP_3)).toBe(1);
    expect(playsFor(BEEP)).toBe(0);
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(playsFor(BEEP)).toBe(1);
  });

  it("stops and releases previous player before playing new one on transition and pause/resume", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 1, color: "#fff", sound: "beep_3" },
      { id: "b", name: "B", duration: 1, color: "#fff", sound: "beep" },
    ]);
    await flush();
    const beep3Player = getPlayer(BEEP_3);

    // Initial start: freshly created, seekTo is never needed, play is called
    expect(beep3Player.seekTo).not.toHaveBeenCalled();
    expect(beep3Player.play).toHaveBeenCalledTimes(1);

    // Advance to next interval (transition to B)
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    await flush();

    // Previous player for A is stopped and released
    expect(beep3Player.pause).toHaveBeenCalled();
    expect(beep3Player.release).toHaveBeenCalled();

    const beepPlayer = getPlayer(BEEP);
    expect(beepPlayer.seekTo).not.toHaveBeenCalled();
    expect(beepPlayer.play).toHaveBeenCalledTimes(1);

    // Pause: stops and releases active player
    fireEvent.press(getByText("pause"));
    await flush();
    expect(beepPlayer.pause).toHaveBeenCalled();
    expect(beepPlayer.release).toHaveBeenCalled();

    // Resume: creates a fresh player and plays cleanly without seekTo
    fireEvent.press(getByText("play"));
    await flush();
    expect(playsFor(BEEP)).toBe(2);
  });

  it("plays cleanly from 0 without calling seekTo on fresh interval cues", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep" },
    ]);
    await flush();

    const beepPlayer = getPlayer(BEEP);
    expect(beepPlayer.play).toHaveBeenCalledTimes(1);
    expect(beepPlayer.seekTo).not.toHaveBeenCalled();

    fireEvent.press(getByText("pause"));
    fireEvent.press(getByText("play"));
    await flush();

    const mock = createAudioPlayer as jest.Mock;
    const pausePlayer = mock.mock.results[1].value;
    const resumePlayer = mock.mock.results[2].value;
    expect(pausePlayer.seekTo).not.toHaveBeenCalled();
    expect(pausePlayer.play).toHaveBeenCalledTimes(1);
    expect(resumePlayer.seekTo).not.toHaveBeenCalled();
    expect(resumePlayer.play).toHaveBeenCalledTimes(1);
  });

  it("plays the current interval's sound on resume", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    fireEvent.press(getByText("pause"));
    fireEvent.press(getByText("play"));
    await flush();
    expect(playsFor(BEEP_3)).toBe(2);
    expect(playsFor(PAUSE)).toBe(1);
  });

  it("plays no interval sound for a none interval, while still playing Timer Pause Audio on pause", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "none" },
    ]);
    await flush();
    expect(createAudioPlayer).not.toHaveBeenCalled();

    fireEvent.press(getByText("pause"));
    await flush();
    expect(playsFor(PAUSE)).toBe(1);
    expect(playsFor(BEEP)).toBe(0);

    fireEvent.press(getByText("play"));
    await flush();
    expect(playsFor(PAUSE)).toBe(1);
    expect(playsFor(BEEP)).toBe(0);
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
  });

  it("plays the beep for unknown and absent sounds", async () => {
    renderTimer([
      { id: "a", name: "A", duration: 1, color: "#fff", sound: "mystery" },
      { id: "b", name: "B", duration: 1, color: "#fff" },
    ]);
    await flush();
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    await flush();
    expect(playsFor(BEEP)).toBe(2);
  });

  it("pauses and releases active player upon unmount", async () => {
    const { unmount } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep_3" },
      { id: "b", name: "B", duration: 5, color: "#fff", sound: "beep" },
    ]);
    await flush();
    const beep3Player = getPlayer(BEEP_3);

    unmount();
    expect(beep3Player.pause).toHaveBeenCalled();
    expect(beep3Player.release).toHaveBeenCalled();
  });

  it("pauses and releases active player upon workout completion", async () => {
    const { navigation } = renderTimer([
      { id: "a", name: "A", duration: 1, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    const beep3Player = getPlayer(BEEP_3);

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(navigation.replace).toHaveBeenCalledWith("Completion", expect.anything());
    expect(beep3Player.pause).toHaveBeenCalled();
    expect(beep3Player.release).toHaveBeenCalled();
  });

  it("pauses and releases active player upon leaving the workout via exit alert", async () => {
    const { getByText, getByTestId, navigation } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    const beep3Player = getPlayer(BEEP_3);

    fireEvent.press(getByTestId("timer-back-button"));
    fireEvent.press(getByText("Leave"));

    expect(navigation.popToTop).toHaveBeenCalled();
    expect(beep3Player.pause).toHaveBeenCalled();
    expect(beep3Player.release).toHaveBeenCalled();
  });

  it("configures audio session to mixWithOthers when playing interval sounds", async () => {
    renderTimer([
      { id: "a", name: "A", duration: 1, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
    });
  });

  it("stops and releases previous player before playing target sound when jumping to a past interval while running", async () => {
    const { getByTestId } = renderTimer([
      { id: "a", name: "A", duration: 1, color: "#10B981", sound: "beep_3" },
      { id: "b", name: "B", duration: 2, color: "#6B7280", sound: "beep" },
    ]);
    await flush();

    // Advance into interval B
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    await flush();

    const beepPlayer = getPlayer(BEEP);
    expect(playsFor(BEEP_3)).toBe(1);
    expect(playsFor(BEEP)).toBe(1);

    // Tap past interval A while running
    fireEvent.press(getByTestId("interval-timeline-row-0"));
    await flush();

    expect(beepPlayer.pause).toHaveBeenCalled();
    expect(beepPlayer.release).toHaveBeenCalled();
    expect(playsFor(BEEP_3)).toBe(2);
  });

  it("replays the active interval sound cleanly when tapping the active interval while running", async () => {
    const { getByTestId } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#10B981", sound: "beep_3" },
    ]);
    await flush();

    const firstPlayer = getPlayer(BEEP_3);
    expect(playsFor(BEEP_3)).toBe(1);

    fireEvent.press(getByTestId("interval-timeline-row-0"));
    await flush();

    expect(firstPlayer.pause).toHaveBeenCalled();
    expect(firstPlayer.release).toHaveBeenCalled();
    expect(playsFor(BEEP_3)).toBe(2);
  });

  it("stays silent when jumping while paused and plays the newly selected interval sound on Play", async () => {
    const { getByTestId, getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#10B981", sound: "beep_3" },
      { id: "b", name: "B", duration: 5, color: "#6B7280", sound: "beep" },
    ]);
    await flush();
    expect(playsFor(BEEP_3)).toBe(1);
    expect(playsFor(BEEP)).toBe(0);

    // Pause
    fireEvent.press(getByText("pause"));
    await flush();

    // Jump to interval B while paused -> stays silent
    fireEvent.press(getByTestId("interval-timeline-row-1"));
    await flush();
    expect(playsFor(BEEP)).toBe(0);

    // Press Play -> plays interval B's sound
    fireEvent.press(getByText("play"));
    await flush();
    expect(playsFor(BEEP)).toBe(1);
  });

  it("plays Timer Pause Audio once on modal auto-pause and plays interval sound when canceling exit modal", async () => {
    const { getByTestId, getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#10B981", sound: "beep_3" },
    ]);
    await flush();
    expect(playsFor(BEEP_3)).toBe(1);
    expect(playsFor(PAUSE)).toBe(0);

    // Open exit alert while running -> pauses and plays pause sound
    fireEvent.press(getByTestId("timer-back-button"));
    await flush();
    expect(playsFor(PAUSE)).toBe(1);

    // Cancel exit alert -> resumes and plays interval sound
    fireEvent.press(getByText("Keep Going"));
    await flush();
    expect(playsFor(BEEP_3)).toBe(2);
  });

  it("does not replay Timer Pause Audio when opening a modal while already paused", async () => {
    const { getByTestId, getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#10B981", sound: "beep_3" },
    ]);
    await flush();

    // Pause explicitly -> plays pause sound once
    fireEvent.press(getByText("pause"));
    await flush();
    expect(playsFor(PAUSE)).toBe(1);

    // Open exit alert while already paused -> must NOT replay pause sound
    fireEvent.press(getByTestId("timer-back-button"));
    await flush();
    expect(playsFor(PAUSE)).toBe(1);
  });

  it("stops and releases Timer Pause Audio player on resume and unmount", async () => {
    const { getByText, unmount } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#10B981", sound: "beep_3" },
    ]);
    await flush();

    fireEvent.press(getByText("pause"));
    await flush();
    const firstPausePlayer = getPlayer(PAUSE);
    expect(firstPausePlayer.play).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("play"));
    await flush();
    expect(firstPausePlayer.pause).toHaveBeenCalled();
    expect(firstPausePlayer.release).toHaveBeenCalled();

    fireEvent.press(getByText("pause"));
    await flush();
    const mock = createAudioPlayer as jest.Mock;
    const secondPausePlayer = mock.mock.results[mock.mock.results.length - 1].value;
    unmount();
    expect(secondPausePlayer.pause).toHaveBeenCalled();
    expect(secondPausePlayer.release).toHaveBeenCalled();
  });
});
