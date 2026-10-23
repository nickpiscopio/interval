import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import TimerScreen from "../TimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";

describe("TimerScreen", () => {
  const mockTimer: Timer = {
    id: "timer-1",
    name: "Quick HIIT",
    rounds: 2,
    intervals: [
      { id: "i1", name: "Jumping Jacks", duration: 2, color: "#10B981" },
      { id: "i2", name: "Rest", duration: 1, color: "#6B7280" },
    ],
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders countdown interval and handles pause and resume", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText } = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByText("Jumping Jacks")).toBeTruthy();
    expect(getByText("Quick HIIT")).toBeTruthy();

    // Pause timer
    const pauseIcon = getByText("pause");
    fireEvent.press(pauseIcon);

    expect(getByText("play")).toBeTruthy();

    // Resume timer
    const playIcon = getByText("play");
    fireEvent.press(playIcon);

    expect(getByText("pause")).toBeTruthy();
  });

  it("shows exit confirmation alert when close button is pressed", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText } = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    const closeBtn = getByText("close");
    fireEvent.press(closeBtn);

    expect(getByText("Leave Workout?")).toBeTruthy();

    const cancelBtn = getByText("Keep Going");
    fireEvent.press(cancelBtn);

    expect(mockNavigation.popToTop).not.toHaveBeenCalled();

    // Now press close again and confirm leave
    fireEvent.press(closeBtn);
    const leaveBtn = getByText("Leave");
    fireEvent.press(leaveBtn);

    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });

  it("renders preparing fallback when timer has empty intervals", () => {
    const emptyTimer: Timer = {
      id: "empty-t",
      name: "Empty",
      rounds: 1,
      intervals: [],
    };

    const { getByText } = render(
      <AlertProvider>
        <TimerScreen
          navigation={{} as any}
          route={{ params: { timer: emptyTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByText("Preparing workout...")).toBeTruthy();
  });

  it("completes full workout loop and replaces screen with Completion screen", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };

    render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    // Advance all intervals across rounds (2 rounds * 3s = 6s)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith("Completion", {
      timer: mockTimer,
    });
    expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");
  });

  it("manages screen wake lock lifecycle across mount, pause, resume, alert, and unmount", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText, unmount } = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    // Should activate keep awake on mount
    expect(activateKeepAwakeAsync).toHaveBeenCalledWith("timer-running");

    // Pause timer -> should deactivate keep awake
    const pauseIcon = getByText("pause");
    fireEvent.press(pauseIcon);
    expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");

    // Resume timer -> should re-activate keep awake
    const playIcon = getByText("play");
    fireEvent.press(playIcon);
    expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(2);

    // Open close dialog -> should deactivate keep awake
    const closeBtn = getByText("close");
    fireEvent.press(closeBtn);
    expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");

    // Dismiss close dialog with 'Keep Going' -> should re-activate
    const cancelBtn = getByText("Keep Going");
    fireEvent.press(cancelBtn);
    expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(3);

    // Unmount -> should ensure keep awake is deactivated
    unmount();
    expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");
  });
});
