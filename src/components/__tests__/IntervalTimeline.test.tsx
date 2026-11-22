import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SafeAreaContext = require("react-native-safe-area-context");

import IntervalTimeline, {
  INTERVAL_TIMELINE_ROW_HEIGHT,
  INTERVAL_TIMELINE_TOP_PADDING,
} from "../IntervalTimeline";
import { Interval } from "../../model/Interval";
import Colors from "../../constants/Colors";
import Spacing from "../../constants/Spacing";

describe("IntervalTimeline", () => {
  const sampleIntervals: Interval[] = [
    { id: "i1", name: "Warmup", duration: 10, color: "#1ACC6C" },
    { id: "i2", name: "Sprint", duration: 20, color: "#E63946" },
    { id: "i3", name: "Rest", duration: 10, color: "#3B82F6" },
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders portrait docked layout with top border and 30% height by default", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <IntervalTimeline
        intervals={sampleIntervals}
        currentIntervalIndex={0}
        activeColor="#1ACC6C"
        onSelectInterval={onSelect}
      />
    );

    const containerStyle = StyleSheet.flatten(
      getByTestId("interval-timeline-container").props.style
    );
    expect(containerStyle.height).toBe("30%");
    expect(containerStyle.borderTopWidth).toBe(StyleSheet.hairlineWidth);
    expect(containerStyle.borderTopColor).toBe(Colors.surface.timelineBorder);
    expect(containerStyle.borderLeftWidth).toBeUndefined();

    const list = getByTestId("interval-timeline");
    const contentStyle = StyleSheet.flatten(list.props.contentContainerStyle);
    expect(contentStyle.paddingTop).toBe(INTERVAL_TIMELINE_TOP_PADDING);
    expect(contentStyle.paddingBottom).toBe(34); // default jest safe-area bottom inset
  });

  it("renders full-height 45%-width landscape layout with left border and safe-area padding", () => {
    jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
      top: 20,
      bottom: 24,
      left: 44,
      right: 48,
    });

    const scrollSpy = jest
      .spyOn(FlatList.prototype, "scrollToOffset")
      .mockImplementation(() => {});

    const onSelect = jest.fn();
    const { getByTestId } = render(
      <IntervalTimeline
        intervals={sampleIntervals}
        currentIntervalIndex={2}
        activeColor="#3B82F6"
        onSelectInterval={onSelect}
        isLandscape
      />
    );

    const containerStyle = StyleSheet.flatten(
      getByTestId("interval-timeline-container").props.style
    );
    expect(containerStyle.height).toBe("100%");
    expect(containerStyle.width).toBe("45%");
    expect(containerStyle.borderTopWidth).toBe(0);
    expect(containerStyle.borderLeftWidth).toBe(StyleSheet.hairlineWidth);
    expect(containerStyle.borderLeftColor).toBe(Colors.surface.timelineBorder);

    const list = getByTestId("interval-timeline");
    const contentStyle = StyleSheet.flatten(list.props.contentContainerStyle);
    expect(contentStyle.paddingTop).toBe(20);
    expect(contentStyle.paddingBottom).toBe(24);
    expect(contentStyle.paddingRight).toBe(48);

    // getItemLayout and auto-scroll offset account for landscape top safe-area padding
    const itemLayout = list.props.getItemLayout(sampleIntervals, 1);
    expect(itemLayout).toEqual({
      length: INTERVAL_TIMELINE_ROW_HEIGHT,
      offset: 20 + INTERVAL_TIMELINE_ROW_HEIGHT,
      index: 1,
    });
    expect(scrollSpy).toHaveBeenCalledWith({
      offset: 20 + 1 * INTERVAL_TIMELINE_ROW_HEIGHT,
      animated: true,
    });
  });

  it("uses minimum fallback padding in landscape when safe-area insets are 0", () => {
    jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });

    const { getByTestId } = render(
      <IntervalTimeline
        intervals={sampleIntervals}
        currentIntervalIndex={0}
        activeColor="#1ACC6C"
        onSelectInterval={jest.fn()}
        isLandscape
      />
    );

    const list = getByTestId("interval-timeline");
    const contentStyle = StyleSheet.flatten(list.props.contentContainerStyle);
    expect(contentStyle.paddingTop).toBe(INTERVAL_TIMELINE_TOP_PADDING);
    expect(contentStyle.paddingBottom).toBe(Spacing.md);
    expect(contentStyle.paddingRight).toBe(Spacing.md);
  });

  it("invokes onSelectInterval when a row is pressed", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <IntervalTimeline
        intervals={sampleIntervals}
        currentIntervalIndex={0}
        activeColor="#1ACC6C"
        onSelectInterval={onSelect}
        isLandscape
      />
    );

    fireEvent.press(getByTestId("interval-timeline-row-1"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("returns null when intervals array is empty", () => {
    const { queryByTestId } = render(
      <IntervalTimeline
        intervals={[]}
        currentIntervalIndex={0}
        activeColor="#1ACC6C"
        onSelectInterval={jest.fn()}
      />
    );
    expect(queryByTestId("interval-timeline-container")).toBeNull();
  });
});
