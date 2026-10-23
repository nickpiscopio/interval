import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { createAudioPlayer } from "expo-audio";
import TimerScreen from "../TimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";

// jest-expo maps every asset to the same stub, so give each sound a distinct source.
const BEEP = "beep-source";
const BEEP_3 = "beep3-source";
jest.mock("../../constants/Sounds", () => {
  const actual = jest.requireActual("../../constants/Sounds");
  const sources: Record<string, string> = { beep: "beep-source", beep_3: "beep3-source" };
  return {
    ...actual,
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
    const secondPlayer = mock.mock.results[1].value;
    expect(secondPlayer.seekTo).not.toHaveBeenCalled();
    expect(secondPlayer.play).toHaveBeenCalledTimes(1);
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
  });

  it("plays nothing for a none interval", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "none" },
    ]);
    await flush();
    fireEvent.press(getByText("pause"));
    fireEvent.press(getByText("play"));
    await flush();
    expect(createAudioPlayer).not.toHaveBeenCalled();
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
    const { getByText, navigation } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    const beep3Player = getPlayer(BEEP_3);

    fireEvent.press(getByText("close"));
    fireEvent.press(getByText("Leave"));

    expect(navigation.popToTop).toHaveBeenCalled();
    expect(beep3Player.pause).toHaveBeenCalled();
    expect(beep3Player.release).toHaveBeenCalled();
  });
});
