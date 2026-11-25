import React from "react";
import { Animated, FlatList, StyleSheet } from "react-native";
import { render, fireEvent, act, within } from "@testing-library/react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { createAudioPlayer } from "expo-audio";
import { logEvent as firebaseLogEvent } from "@react-native-firebase/analytics";
import { recordError as firebaseRecordError } from "@react-native-firebase/crashlytics";
import TimerScreen from "../TimerScreen";
import {
  INTERVAL_TIMELINE_ROW_HEIGHT,
  INTERVAL_TIMELINE_TOP_PADDING,
} from "../../components/IntervalTimeline";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";
import Spacing from "../../constants/Spacing";
import Colors from "../../constants/Colors";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactNative = require("react-native");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SafeAreaContext = require("react-native-safe-area-context");

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

  it("shows exit confirmation alert when back button is pressed and restores prior pause state on cancel", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => true),
      replace: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText, getByTestId, queryByText } = render(
      <AlertProvider>
        <TimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    expect(queryByText("close")).toBeNull();

    const backBtn = getByTestId("timer-back-button");
    expect(within(backBtn).getByText("arrow-back")).toBeTruthy();

    const backStyle = StyleSheet.flatten(backBtn.props.style);
    expect(backStyle.width).toBe(Spacing.touchTarget.icon);
    expect(backStyle.height).toBe(Spacing.touchTarget.icon);
    expect(backStyle.marginLeft).toBe(-10);

    // Pressing back pauses the timer and shows exit confirmation
    fireEvent.press(backBtn);
    expect(getByText("play")).toBeTruthy();
    expect(getByText("Leave Workout?")).toBeTruthy();

    // Canceling restores running state
    const cancelBtn = getByText("Keep Going");
    fireEvent.press(cancelBtn);
    expect(getByText("pause")).toBeTruthy();
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
    expect(mockNavigation.popToTop).not.toHaveBeenCalled();

    // Pause manually, then open back alert and cancel -> stays paused
    fireEvent.press(getByText("pause"));
    expect(getByText("play")).toBeTruthy();
    fireEvent.press(backBtn);
    fireEvent.press(getByText("Keep Going"));
    expect(getByText("play")).toBeTruthy();

    // Now press back again and confirm leave -> navigates back one screen when a prior route exists
    fireEvent.press(backBtn);
    const leaveBtn = getByText("Leave");
    fireEvent.press(leaveBtn);

    expect(mockNavigation.canGoBack).toHaveBeenCalledTimes(1);
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    expect(mockNavigation.popToTop).not.toHaveBeenCalled();
  });

  it("falls back to popToTop on exit confirmation when navigation cannot go back", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
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

    fireEvent.press(getByTestId("timer-back-button"));
    fireEvent.press(getByText("Leave"));

    expect(mockNavigation.canGoBack).toHaveBeenCalledTimes(1);
    expect(mockNavigation.popToTop).toHaveBeenCalledTimes(1);
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
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
      performedSeconds: 6,
      completedIntervals: 4,
      qualifiesForCredit: true,
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

    const { getByText, getByTestId, unmount } = render(
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

    // Open back dialog -> should deactivate keep awake
    const backBtn = getByTestId("timer-back-button");
    fireEvent.press(backBtn);
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
      canGoBack: jest.fn(() => true),
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

    // Let final interval finish -> navigates to Completion with actual performed credit (< 85%)
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith("Completion", {
      timer: mockTimer,
      performedSeconds: 1,
      completedIntervals: 1,
      qualifiesForCredit: false,
    });
  });

  it("qualifies for credit when at least 85% of total time is performed after skipping a brief interval", () => {
    const briefWarmupTimer: Timer = {
      id: "brief-1",
      name: "Warmup & Work",
      rounds: 1,
      intervals: [
        { id: "i1", name: "Warmup", duration: 1, color: "#3B82F6" },
        { id: "i2", name: "Main Set", duration: 9, color: "#10B981" },
      ],
    };

    const { getByTestId, mockNavigation } = renderTimerScreen(briefWarmupTimer);

    // Skip the 1s warmup and run the full 9s main set (9 / 10 = 90% >= 85%)
    fireEvent.press(getByTestId("interval-timeline-row-1"));

    act(() => {
      jest.advanceTimersByTime(9100);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith("Completion", {
      timer: briefWarmupTimer,
      performedSeconds: 9,
      completedIntervals: 1,
      qualifiesForCredit: true,
    });
  });

  it("caps each interval's credit at its own duration so replaying interval 1 cannot game the 85% threshold", () => {
    const { getByTestId, mockNavigation } = renderTimerScreen(mockTimer);

    // Run interval 0 (2s) almost to completion, restart it twice (accumulating 5.4s of wall time on interval 0 alone)
    act(() => {
      jest.advanceTimersByTime(1800);
    });
    fireEvent.press(getByTestId("interval-timeline-row-0"));
    act(() => {
      jest.advanceTimersByTime(1800);
    });
    fireEvent.press(getByTestId("interval-timeline-row-0"));
    act(() => {
      jest.advanceTimersByTime(1800);
    });

    // Skip straight to final interval (index 3: 1s) and finish it
    // Interval 0 is capped at 2s + interval 3 is 1s = 3s / 6s (50% < 85%)
    fireEvent.press(getByTestId("interval-timeline-row-3"));
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith("Completion", {
      timer: mockTimer,
      performedSeconds: 3,
      completedIntervals: 2,
      qualifiesForCredit: false,
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

  it("unlocks screen orientation on mount and re-locks to PORTRAIT_UP on unmount, exit confirmation, and completion", () => {
    // 1. Mount & unmount
    const { unmount } = renderTimerScreen();
    expect(ScreenOrientation.unlockAsync).toHaveBeenCalledTimes(1);

    unmount();
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );

    // 2. Exit confirmation
    jest.clearAllMocks();
    const exitRun = renderTimerScreen();
    expect(ScreenOrientation.unlockAsync).toHaveBeenCalledTimes(1);
    fireEvent.press(exitRun.getByTestId("timer-back-button"));
    expect(ScreenOrientation.lockAsync).not.toHaveBeenCalled();
    fireEvent.press(exitRun.getByText("Leave"));
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    exitRun.unmount();

    // 3. Workout completion
    jest.clearAllMocks();
    const completeRun = renderTimerScreen();
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    completeRun.unmount();
  });

  it("renders full-bleed progress bar as a direct child of the root container and rounded-square Play/Pause button", () => {
    const { getByTestId } = renderTimerScreen();

    const root = getByTestId("timer-screen-container");
    const progressBar = getByTestId("timer-progress-bar");

    // Direct child of root container (not trapped inside upperRegion)
    const directChildTestIds = root.children
      .map((child: any) => child?.props?.testID)
      .filter(Boolean);
    expect(directChildTestIds).toContain("timer-progress-bar");
    expect(progressBar.props.pointerEvents).toBe("none");

    const barStyle = StyleSheet.flatten(progressBar.props.style);
    expect(barStyle.position).toBe("absolute");
    expect(barStyle.left).toBe(0);
    expect(barStyle.right).toBe(0);
    expect(barStyle.bottom).toBe(0);
    expect(barStyle.width).toBe("100%");

    // Rounded-square Play/Pause button (56x56, RADIUS.md = 16)
    const playPauseStyle = StyleSheet.flatten(
      getByTestId("timer-play-pause-button").props.style
    );
    expect(playPauseStyle.width).toBe(Spacing.touchTarget.cta);
    expect(playPauseStyle.minHeight).toBe(Spacing.touchTarget.cta);
    expect(playPauseStyle.borderRadius).toBe(Spacing.radius.md);
  });

  it("renders 55%/45% horizontal split, scaled 72px countdown, 2-line auto-fitting name, left-bordered timeline, and safe-area padding in landscape", () => {
    const dimSpy = jest.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
      width: 844,
      height: 390,
      scale: 3,
      fontScale: 1,
    });
    const insetsSpy = jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
      top: 12,
      bottom: 21,
      left: 47,
      right: 47,
    });

    try {
      const { getByTestId } = renderTimerScreen();

      // Root container switches to horizontal row
      const rootStyle = StyleSheet.flatten(
        getByTestId("timer-screen-container").props.style
      );
      expect(rootStyle.flexDirection).toBe("row");

      // Left pane ~55% with safe-area padding
      const upperStyle = StyleSheet.flatten(
        getByTestId("timer-upper-region").props.style
      );
      expect(upperStyle.width).toBe("55%");
      expect(upperStyle.paddingTop).toBe(12);
      expect(upperStyle.paddingLeft).toBe(47);
      expect(upperStyle.paddingBottom).toBe(21);

      // Scaled 72px countdown (lineHeight 80)
      const countdownStyle = StyleSheet.flatten(
        getByTestId("hero-countdown").props.style
      );
      expect(countdownStyle.fontSize).toBe(72);
      expect(countdownStyle.lineHeight).toBe(80);

      // 2-line auto-fitting interval name
      const intervalName = getByTestId("hero-interval-name");
      expect(intervalName.props.numberOfLines).toBe(2);
      expect(intervalName.props.adjustsFontSizeToFit).toBe(true);

      // Right pane 45% full-height left-bordered IntervalTimeline
      const timelineStyle = StyleSheet.flatten(
        getByTestId("interval-timeline-container").props.style
      );
      expect(timelineStyle.width).toBe("45%");
      expect(timelineStyle.height).toBe("100%");
      expect(timelineStyle.borderLeftWidth).toBe(StyleSheet.hairlineWidth);
      expect(timelineStyle.borderLeftColor).toBe(Colors.surface.timelineBorder);
      expect(timelineStyle.borderTopWidth).toBe(0);
    } finally {
      dimSpy.mockRestore();
      insetsSpy.mockRestore();
    }
  });

  it("emits timer_started on launch, timer_abandoned on early exit, and records non-fatal on audio failure", () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const audioError = new Error("audio codec error");
      (createAudioPlayer as jest.Mock).mockImplementationOnce(() => {
        throw audioError;
      });

      const mockNavigation: any = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        canGoBack: jest.fn(() => true),
        replace: jest.fn(),
        popToTop: jest.fn(),
      };

      const { getByTestId, getByText } = render(
        <AlertProvider>
          <TimerScreen
            navigation={mockNavigation}
            route={{
              params: {
                timer: { ...mockTimer, isAiGenerated: true },
              },
            } as any}
          />
        </AlertProvider>
      );

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "timer_started",
        {
          is_ai_generated: true,
          interval_count: 2,
          rounds: 2,
          total_seconds: 6,
        }
      );

      expect(firebaseRecordError).toHaveBeenCalledWith(
        expect.anything(),
        audioError,
        "audio.interval_sound"
      );

      // Advance 3 seconds (50% of 6s total)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Exit workout early
      fireEvent.press(getByTestId("timer-back-button"));
      fireEvent.press(getByText("Leave"));

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "timer_abandoned",
        {
          is_ai_generated: true,
          total_seconds: 6,
          performed_seconds: 3,
          completion_pct: 50,
        }
      );
    } finally {
      (global as any).__DEV__ = originalDev;
      warnSpy.mockRestore();
    }
  });
});
