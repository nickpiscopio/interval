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

function renderTimer(intervals: Timer["intervals"], rounds = 1) {
  const timer: Timer = { id: "t", name: "T", rounds, intervals };
  const navigation: any = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
  return render(
    <AlertProvider>
      <TimerScreen navigation={navigation} route={{ params: { timer } } as any} />
    </AlertProvider>
  );
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

  it("plays the current interval's sound on resume", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "beep_3" },
    ]);
    await flush();
    fireEvent.press(getByText("pause"));
    fireEvent.press(getByText("play"));
    expect(playsFor(BEEP_3)).toBe(2);
  });

  it("plays nothing for a none interval", async () => {
    const { getByText } = renderTimer([
      { id: "a", name: "A", duration: 5, color: "#fff", sound: "none" },
    ]);
    await flush();
    fireEvent.press(getByText("pause"));
    fireEvent.press(getByText("play"));
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
    expect(playsFor(BEEP)).toBe(2);
  });
});
