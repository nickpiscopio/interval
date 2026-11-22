import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Interval } from "../model/Interval";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";

export const INTERVAL_TIMELINE_ROW_HEIGHT = Spacing.touchTarget.min;
export const INTERVAL_TIMELINE_TOP_PADDING = Spacing.sm;

interface IntervalTimelineProps {
  intervals: Interval[];
  currentIntervalIndex: number;
  activeColor: string;
  onSelectInterval: (index: number) => void;
  isLandscape?: boolean;
}

export default function IntervalTimeline({
  intervals,
  currentIntervalIndex,
  activeColor,
  onSelectInterval,
  isLandscape = false,
}: IntervalTimelineProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Interval>>(null);
  const isUserScrollingRef = useRef(false);
  const topPadding = isLandscape
    ? Math.max(insets.top, INTERVAL_TIMELINE_TOP_PADDING)
    : INTERVAL_TIMELINE_TOP_PADDING;

  function scrollToActiveIndex(index: number): void {
    const targetIndex = Math.max(0, index - 1);
    const targetOffset =
      targetIndex === 0
        ? 0
        : topPadding + targetIndex * INTERVAL_TIMELINE_ROW_HEIGHT;
    listRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
  }

  useEffect(() => {
    if (!isUserScrollingRef.current && intervals.length > 0) {
      scrollToActiveIndex(currentIntervalIndex);
    }
  }, [currentIntervalIndex, intervals.length, topPadding]);

  if (intervals.length === 0) {
    return null;
  }

  function handleSelectInterval(index: number): void {
    isUserScrollingRef.current = false;
    if (index === currentIntervalIndex) {
      scrollToActiveIndex(index);
    }
    onSelectInterval(index);
  }

  return (
    <View
      testID="interval-timeline-container"
      style={[styles.container, isLandscape && styles.containerLandscape]}
    >
      <FlatList
        ref={listRef}
        testID="interval-timeline"
        data={intervals}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        getItemLayout={(_, index) => ({
          length: INTERVAL_TIMELINE_ROW_HEIGHT,
          offset: topPadding + INTERVAL_TIMELINE_ROW_HEIGHT * index,
          index,
        })}
        onScrollBeginDrag={() => {
          isUserScrollingRef.current = true;
        }}
        onScrollEndDrag={(event) => {
          const velocityY = Math.abs(event.nativeEvent?.velocity?.y ?? 0);
          if (velocityY === 0) {
            isUserScrollingRef.current = false;
          }
        }}
        onMomentumScrollBegin={() => {
          isUserScrollingRef.current = true;
        }}
        onMomentumScrollEnd={() => {
          isUserScrollingRef.current = false;
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: topPadding,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
            paddingRight: isLandscape ? Math.max(insets.right, Spacing.md) : Spacing.md,
          },
        ]}
        renderItem={({ item, index }) => {
          const isPast = index < currentIntervalIndex;
          const isActive = index === currentIntervalIndex;
          const isLast = index === intervals.length - 1;
          const isBeforeActive = index === currentIntervalIndex - 1;
          const showDivider = !isActive && !isLast && !isBeforeActive;

          const textStateStyle = [
            styles.rowText,
            isPast && styles.pastText,
            isActive && [styles.activeText, { color: activeColor }],
          ];

          return (
            <TouchableOpacity
              testID={`interval-timeline-row-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              activeOpacity={0.75}
              onPress={() => handleSelectInterval(index)}
              style={[
                styles.row,
                isActive && styles.activeRow,
                showDivider && styles.rowDivider,
              ]}
            >
              <Text numberOfLines={1} style={[styles.nameText, textStateStyle]}>
                {item.name}
              </Text>
              <Text style={textStateStyle}>{`${item.duration}s`}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "30%",
    backgroundColor: Colors.surface.timeline,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.surface.timelineBorder,
  },
  containerLandscape: {
    height: "100%",
    width: "45%",
    borderTopWidth: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.surface.timelineBorder,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: INTERVAL_TIMELINE_TOP_PADDING,
  },
  row: {
    height: INTERVAL_TIMELINE_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  activeRow: {
    backgroundColor: Colors.surface.timelineActivePill,
    borderRadius: Spacing.radius.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surface.timelineRowDivider,
  },
  rowText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: FontSize.fontFamily.medium,
    color: Colors.textScale.inverse,
  },
  nameText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  pastText: {
    opacity: 0.45,
  },
  activeText: {
    fontFamily: FontSize.fontFamily.bold,
  },
});
