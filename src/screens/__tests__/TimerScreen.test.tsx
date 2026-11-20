import React from "react";
import { Animated, FlatList } from "react-native";
import { render, fireEvent, act, within } from "@testing-library/react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import TimerScreen from "../TimerScreen";
import {
  INTERVAL_TIMELINE_ROW_HEIGHT,
  INTERVAL_TIMELINE_TOP_PADDING,
} from "../../components/IntervalTimeline";
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

    const { getByText, getByTestId } = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByTestId("hero-interval-name").props.children).toBe("Jumping Jacks");
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

  function renderTimerScreen(timer: Timer = mockTimer) {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };
    const utils = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer } } as any}
        />
      </AlertProvider>
    );
    return { ...utils, mockNavigation };
  }

  it("renders all flattened intervals across rounds in the Interval Timeline and removes the legacy NEXT UP card", () => {
    const { getByTestId, queryByText } = renderTimerScreen();

    expect(queryByText("NEXT UP")).toBeNull();
    expect(getByTestId("interval-timeline")).toBeTruthy();

    // 2 rounds * 2 intervals = 4 flattened rows
    const row0 = getByTestId("interval-timeline-row-0");
    const row1 = getByTestId("interval-timeline-row-1");
    const row2 = getByTestId("interval-timeline-row-2");
    const row3 = getByTestId("interval-timeline-row-3");

    expect(within(row0).getByText("Jumping Jacks")).toBeTruthy();
    expect(within(row0).getByText("2s")).toBeTruthy();
    expect(within(row1).getByText("Rest")).toBeTruthy();
    expect(within(row1).getByText("1s")).toBeTruthy();
    expect(within(row2).getByText("Jumping Jacks")).toBeTruthy();
    expect(within(row2).getByText("2s")).toBeTruthy();
    expect(within(row3).getByText("Rest")).toBeTruthy();
    expect(within(row3).getByText("1s")).toBeTruthy();

    // Active row selected state
    expect(row0.props.accessibilityState).toEqual({ selected: true });
    expect(row1.props.accessibilityState).toEqual({ selected: false });
  });

  it("renders the Interval Timeline even for a single-interval, single-round timer", () => {
    const singleTimer: Timer = {
      id: "single-1",
      name: "Solo Plank",
      rounds: 1,
      intervals: [{ id: "s1", name: "Plank", duration: 30, color: "#10B981" }],
    };

    const { getByTestId } = renderTimerScreen(singleTimer);

    const row0 = getByTestId("interval-timeline-row-0");
    expect(within(row0).getByText("Plank")).toBeTruthy();
    expect(within(row0).getByText("30s")).toBeTruthy();
    expect(row0.props.accessibilityState).toEqual({ selected: true });
  });

  it("jumps back to a past interval while running, resetting countdown, progress animation, metadata, background color, and continuing to tick", () => {
    const timingSpy = jest.spyOn(Animated, "timing");
    try {
      const { getByTestId, getByText } = renderTimerScreen();

      // Advance past Interval 0 (2s) and Interval 1 (1s) into Round 2 Interval 0 (index 2)
      act(() => {
        jest.advanceTimersByTime(3100);
      });

      expect(getByText("Round 2 of 2")).toBeTruthy();
      expect(getByText("Interval 3/4")).toBeTruthy();

      timingSpy.mockClear();

      // Tap past interval index 1 (Rest, 1s, #6B7280)
      fireEvent.press(getByTestId("interval-timeline-row-1"));

      expect(getByTestId("hero-interval-name").props.children).toBe("Rest");
      expect(getByTestId("hero-countdown").props.children).toBe("1s");
      expect(getByText("Round 1 of 2")).toBeTruthy();
      expect(getByText("Interval 2/4")).toBeTruthy();
      expect(getByTestId("timer-screen-container").props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: "#6B7280" })])
      );
      expect(timingSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 0, duration: 1000 })
      );

      // Continues ticking naturally from Rest into Round 2 Jumping Jacks (index 2)
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      expect(getByTestId("hero-interval-name").props.children).toBe("Jumping Jacks");
      expect(getByText("Round 2 of 2")).toBeTruthy();
      expect(getByText("Interval 3/4")).toBeTruthy();
    } finally {
      timingSpy.mockRestore();
    }
  });

  it("restarts the active interval from its full duration when tapped while running", () => {
    const timer: Timer = {
      id: "restart-1",
      name: "Restart Test",
      rounds: 1,
      intervals: [{ id: "i1", name: "Plank", duration: 5, color: "#10B981" }],
    };

    const { getByTestId, mockNavigation } = renderTimerScreen(timer);

    // Let 3 seconds elapse (down to 2s)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(getByTestId("hero-countdown").props.children).toBe("2s");

    // Tap active interval row 0 -> resets to full 5s and keeps running
    fireEvent.press(getByTestId("interval-timeline-row-0"));
    expect(getByTestId("hero-countdown").props.children).toBe("5s");

    // After 2 more seconds it is at 3s (still running, has not completed)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByTestId("hero-countdown").props.children).toBe("3s");
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  it("skips ahead to a future interval and completes normally when the final interval finishes", () => {
    const { getByTestId, getByText, mockNavigation } = renderTimerScreen();

    // Jump straight to the final interval (index 3: Round 2 Rest, 1s)
    fireEvent.press(getByTestId("interval-timeline-row-3"));

    expect(getByTestId("hero-interval-name").props.children).toBe("Rest");
    expect(getByTestId("hero-countdown").props.children).toBe("1s");
    expect(getByText("Round 2 of 2")).toBeTruthy();
    expect(getByText("Interval 4/4")).toBeTruthy();

    // Let final interval finish -> navigates to Completion with original timer
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith("Completion", {
      timer: mockTimer,
    });
  });

  it("switches interval while paused without ticking, animating, or activating wake lock, and resumes cleanly on Play", () => {
    const timingSpy = jest.spyOn(Animated, "timing");
    try {
      const { getByTestId, getByText } = renderTimerScreen();

      // Initial mount activates wake lock once
      expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(1);

      // Pause timer
      fireEvent.press(getByText("pause"));
      expect(deactivateKeepAwake).toHaveBeenCalledWith("timer-running");
      timingSpy.mockClear();

      // Tap interval 2 (Round 2, Jumping Jacks, 2s) while paused
      fireEvent.press(getByTestId("interval-timeline-row-2"));

      expect(getByTestId("hero-interval-name").props.children).toBe("Jumping Jacks");
      expect(getByTestId("hero-countdown").props.children).toBe("2s");
      expect(getByText("Round 2 of 2")).toBeTruthy();
      expect(getByText("Interval 3/4")).toBeTruthy();
      // Still paused (play button shown), no progress animation started, and wake lock NOT re-activated
      expect(getByText("play")).toBeTruthy();
      expect(timingSpy).not.toHaveBeenCalled();
      expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(1);

      // Advancing timers while paused should NOT decrement countdown
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(getByTestId("hero-countdown").props.children).toBe("2s");

      // Press Play -> re-activates wake lock, starts full-duration progress animation, and resumes countdown
      fireEvent.press(getByText("play"));
      expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(2);
      expect(getByText("pause")).toBeTruthy();
      expect(timingSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 0, duration: 2000 })
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(getByTestId("hero-countdown").props.children).toBe("1s");
    } finally {
      timingSpy.mockRestore();
    }
  });

  it("auto-scrolls to keep one completed interval above the active row while yielding to manual scroll and momentum gestures", () => {
    const scrollSpy = jest
      .spyOn(FlatList.prototype, "scrollToOffset")
      .mockImplementation(() => {});

    try {
      const multiTimer: Timer = {
        id: "scroll-1",
        name: "Scroll Test",
        rounds: 3,
        intervals: [
          { id: "i1", name: "Work", duration: 1, color: "#10B981" },
          { id: "i2", name: "Rest", duration: 1, color: "#6B7280" },
        ],
      };

      const { getByTestId } = renderTimerScreen(multiTimer);

      scrollSpy.mockClear();

      // Advance from index 0 -> 1 -> 2 (2s)
      act(() => {
        jest.advanceTimersByTime(2100);
      });

      expect(scrollSpy).toHaveBeenCalledWith({
        offset: INTERVAL_TIMELINE_TOP_PADDING + 1 * INTERVAL_TIMELINE_ROW_HEIGHT,
        animated: true,
      });

      // User flings the timeline (non-zero velocity keeps manual lock active until momentum ends)
      const timeline = getByTestId("interval-timeline");
      fireEvent(timeline, "scrollBeginDrag");
      fireEvent(timeline, "scrollEndDrag", { nativeEvent: { velocity: { y: 1.5 } } });
      scrollSpy.mockClear();

      // Natural transition from index 2 -> 3 during momentum fling must NOT auto-scroll
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(scrollSpy).not.toHaveBeenCalled();

      // Momentum finishes -> next natural transition (index 3 -> 4) resumes auto-scroll
      fireEvent(timeline, "momentumScrollEnd", { nativeEvent: {} });
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(scrollSpy).toHaveBeenCalledWith({
        offset: INTERVAL_TIMELINE_TOP_PADDING + 3 * INTERVAL_TIMELINE_ROW_HEIGHT,
        animated: true,
      });

      // Tapping a different row (index 0) settles cleanly once
      scrollSpy.mockClear();
      fireEvent.press(getByTestId("interval-timeline-row-0"));
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenCalledWith({
        offset: 0,
        animated: true,
      });
    } finally {
      scrollSpy.mockRestore();
    }
  });
});
