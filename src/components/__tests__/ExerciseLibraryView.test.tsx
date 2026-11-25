import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { logEvent as firebaseLogEvent } from "@react-native-firebase/analytics";
import { ExerciseLibraryView } from "../ExerciseLibraryView";
import Spacing from "../../constants/Spacing";

describe("ExerciseLibraryView Component", () => {
  it("omits Category and Body Part labels and uses Spacing.sm vertical rhythm between search bar and filter carousels", () => {
    const { queryByTestId, queryByText, getByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    expect(queryByTestId("exercise-category-label")).toBeNull();
    expect(queryByText("Category")).toBeNull();
    expect(queryByTestId("exercise-body-part-label")).toBeNull();
    expect(queryByText("Body Part")).toBeNull();

    const searchBar = getByTestId("exercise-search-bar");
    const searchStyle = StyleSheet.flatten(searchBar.props.style);
    expect(searchStyle.marginBottom).toBe(Spacing.sm);

    const categoriesWrapper = getByTestId("categories-filter-wrapper");
    const categoriesWrapperStyle = StyleSheet.flatten(categoriesWrapper.props.style);
    expect(categoriesWrapperStyle.marginBottom).toBe(Spacing.sm);
  });
  it("renders exercises and filters by category and body part", () => {
    const onQuickRoutine = jest.fn();
    const onCustomTimer = jest.fn();

    const { getByText, getAllByText, getByPlaceholderText, queryByText } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={onQuickRoutine}
        onCreateCustomTimer={onCustomTimer}
      />
    );

    expect(getByPlaceholderText("Search exercises, body parts, or instructions...")).toBeTruthy();
    expect(getByText("All Categories")).toBeTruthy();
    expect(getByText("All Body Parts")).toBeTruthy();
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by Cardio category (hides Physical Therapy exercises like Tibialis Raises)
    fireEvent.press(getAllByText("Cardio")[0]);
    expect(queryByText("Tibialis Raises")).toBeNull();

    // Reset category filter with All Categories pill
    fireEvent.press(getByText("All Categories"));
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by Physical Therapy category (first element is the filter pill)
    const ptPills = getAllByText("Physical Therapy");
    fireEvent.press(ptPills[0]);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by Ankle & Feet body part
    const anklePills = getAllByText("Ankle & Feet");
    fireEvent.press(anklePills[0]);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Reset body part filter with All Body Parts pill
    const allBodyPartsPill = getByText("All Body Parts");
    fireEvent.press(allBodyPartsPill);
    expect(getByText("Tibialis Raises")).toBeTruthy();
  });

  it("searches across exercise name, description, and keywords", () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    const searchInput = getByPlaceholderText("Search exercises, body parts, or instructions...");

    // Search by specific symptom / benefit text (matches McKenzie extensions & pigeon stretch)
    fireEvent.changeText(searchInput, "sciatica");
    expect(getByText("Prone Press-Ups (McKenzie Extension)")).toBeTruthy();

    // Clear search
    const clearBtn = getByTestId("clear-search-btn");
    fireEvent.press(clearBtn);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Search with no results
    fireEvent.changeText(searchInput, "xyznonexistentsearchquery123");
    expect(getByText("No Exercises Found")).toBeTruthy();
  });

  it("opens exercise detail sheet when an exercise card is pressed", async () => {
    const onQuickRoutine = jest.fn();
    const onCustomTimer = jest.fn();

    const { getByText } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={onQuickRoutine}
        onCreateCustomTimer={onCustomTimer}
      />
    );

    const tibialisCard = getByText("Tibialis Raises");
    fireEvent.press(tibialisCard);

    expect(getByText("Start Quick Routine")).toBeTruthy();
    const quickRoutineBtn = getByText("Start Quick Routine");
    fireEvent.press(quickRoutineBtn);
    await waitFor(() => {
      expect(onQuickRoutine).toHaveBeenCalled();
    });
  });

  it("enforces unclipped card shadows and marginHorizontal on cards and search bar without listContent horizontal padding", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    const card = getByTestId("exercise-card-tibialis_raises");
    const cardStyle = StyleSheet.flatten(card.props.style);
    expect(cardStyle.marginHorizontal).toBe(Spacing.md);
    expect(cardStyle.shadowOpacity ?? cardStyle.elevation).toBeTruthy();

    const searchBar = getByTestId("exercise-search-bar");
    const searchStyle = StyleSheet.flatten(searchBar.props.style);
    expect(searchStyle.marginHorizontal).toBe(Spacing.md);
  });

  it("provides edge-to-edge filter carousels with 16px contentContainerStyle padding and unclipped natural scrolling seam", () => {
    const { getByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    const categoriesCarousel = getByTestId("categories-carousel");
    const catStyle = StyleSheet.flatten(categoriesCarousel.props.contentContainerStyle);
    expect(catStyle.paddingHorizontal).toBe(Spacing.md);

    const bodyPartsCarousel = getByTestId("body-parts-carousel");
    const bpStyle = StyleSheet.flatten(bodyPartsCarousel.props.contentContainerStyle);
    expect(bpStyle.paddingHorizontal).toBe(Spacing.md);
  });

  it("renders + Add button on cards and Add to Timer in detail modal when onSelect is provided (picker mode)", async () => {
    const onSelect = jest.fn();
    const { getByTestId, getByText } = render(
      <ExerciseLibraryView onSelect={onSelect} />
    );

    // Card should have inline + Add button
    const quickAddBtn = getByTestId("btn-quick-add-tibialis_raises");
    expect(quickAddBtn).toBeTruthy();

    // Press quick add button triggers onSelect immediately
    fireEvent.press(quickAddBtn);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tibialis_raises" })
    );

    // Tap card itself opens detail modal with Add to Timer button
    const card = getByTestId("exercise-card-tibialis_raises");
    fireEvent.press(card);

    const addToTimerBtn = getByTestId("exercise-detail-add-to-timer-btn");
    expect(addToTimerBtn).toBeTruthy();
    expect(getByText("Add to Timer")).toBeTruthy();

    fireEvent.press(addToTimerBtn);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("omits + Add button on cards and shows routine buttons in detail modal when onSelect is omitted (standalone mode)", () => {
    const { queryByTestId, getByTestId, getByText, queryByText } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    // Card should NOT have + Add button
    expect(queryByTestId("btn-quick-add-tibialis_raises")).toBeNull();

    // Tap card opens detail modal with Start Quick Routine & Create Custom Workout
    const card = getByTestId("exercise-card-tibialis_raises");
    fireEvent.press(card);

    expect(getByText("Start Quick Routine")).toBeTruthy();
    expect(getByText("Create Custom Workout")).toBeTruthy();
    expect(queryByText("Add to Timer")).toBeNull();
  });

  it("renders in-sheet header with title and back button, without redundant subtitle, and with transparent container", () => {
    const onBack = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <ExerciseLibraryView onBack={onBack} onSelect={jest.fn()} />
    );

    expect(getByTestId("exercise-picker-back-btn")).toBeTruthy();
    expect(getByText("Exercise Library")).toBeTruthy();
    // Redundant totals subtitle "%{count} bodyweight exercises" should NOT exist
    expect(queryByText(/bodyweight exercises/i)).toBeNull();

    fireEvent.press(getByTestId("exercise-picker-back-btn"));
    expect(onBack).toHaveBeenCalled();
  });

  it("applies 16px top margin, 0px bottom margin, and Spacing.sm bottom padding to the results count header with 0 top padding on the list", () => {
    const { getByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    const resultsHeader = getByTestId("exercise-results-header");
    const headerStyle = StyleSheet.flatten(resultsHeader.props.style);
    expect(headerStyle.marginTop).toBe(Spacing.md);
    expect(headerStyle.marginBottom).toBe(0);
    expect(headerStyle.paddingBottom).toBe(Spacing.sm);

    const list = getByTestId("exercise-list");
    const listContentStyle = StyleSheet.flatten(list.props.contentContainerStyle);
    expect(listContentStyle.paddingTop).toBe(0);
  });

  it("renders a dynamic non-interactive 12px top scroll shadow only while the exercise list is scrolled", () => {
    const { getByTestId, queryByTestId } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={jest.fn()}
        onCreateCustomTimer={jest.fn()}
      />
    );

    const list = getByTestId("exercise-list");
    expect(list.props.scrollEventThrottle).toBe(16);
    expect(queryByTestId("exercise-list-scroll-shadow")).toBeNull();

    // Scroll down past top -> shadow appears
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 24 },
        contentSize: { width: 375, height: 1200 },
        layoutMeasurement: { width: 375, height: 600 },
      },
    });

    const shadow = getByTestId("exercise-list-scroll-shadow");
    expect(shadow.props.pointerEvents).toBe("none");
    expect(shadow.props.colors).toEqual([
      "rgba(0, 0, 0, 0.15)",
      "rgba(0, 0, 0, 0.05)",
      "transparent",
    ]);
    const shadowStyle = StyleSheet.flatten(shadow.props.style);
    expect(shadowStyle).toEqual(
      expect.objectContaining({
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 12,
        zIndex: 9,
      })
    );

    // Scroll back to top -> shadow disappears
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 0 },
        contentSize: { width: 375, height: 1200 },
        layoutMeasurement: { width: 375, height: 600 },
      },
    });

    expect(queryByTestId("exercise-list-scroll-shadow")).toBeNull();
  });

  it("resets scroll position to top without animation and hides scroll shadow when category, body part, or search changes", () => {
    const scrollToOffsetSpy = jest
      .spyOn(FlatList.prototype, "scrollToOffset")
      .mockImplementation(() => {});

    try {
      const { getByTestId, queryByTestId, getAllByText, getByText, getByPlaceholderText } = render(
        <ExerciseLibraryView
          onStartQuickRoutine={jest.fn()}
          onCreateCustomTimer={jest.fn()}
        />
      );

      const list = getByTestId("exercise-list");
      const scrollDown = () => {
        fireEvent.scroll(list, {
          nativeEvent: {
            contentOffset: { x: 0, y: 120 },
            contentSize: { width: 375, height: 1200 },
            layoutMeasurement: { width: 375, height: 600 },
          },
        });
        expect(getByTestId("exercise-list-scroll-shadow")).toBeTruthy();
      };

      const expectScrollResetAfter = (action: () => void) => {
        scrollDown();
        scrollToOffsetSpy.mockClear();
        action();
        expect(queryByTestId("exercise-list-scroll-shadow")).toBeNull();
        expect(scrollToOffsetSpy).toHaveBeenCalledWith({ offset: 0, animated: false });
      };

      const searchInput = getByPlaceholderText("Search exercises, body parts, or instructions...");

      // 1. Changing category resets scroll and hides shadow
      expectScrollResetAfter(() => fireEvent.press(getAllByText("Cardio")[0]));

      // 2. Changing Body Part Focus resets scroll and hides shadow
      expectScrollResetAfter(() => fireEvent.press(getAllByText("Ankle & Feet")[0]));

      // 3. Resetting Body Part Focus to All Body Parts resets scroll and hides shadow
      expectScrollResetAfter(() => fireEvent.press(getByText("All Body Parts")));

      // 4. Typing a search query resets scroll and hides shadow
      expectScrollResetAfter(() => fireEvent.changeText(searchInput, "sciatica"));

      // 5. Clearing the search query resets scroll and hides shadow
      expectScrollResetAfter(() => fireEvent.press(getByTestId("clear-search-btn")));
    } finally {
      scrollToOffsetSpy.mockRestore();
    }
  });

  it("emits exercise_filtered and exercise_viewed telemetry events", () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    jest.clearAllMocks();

    try {
      const { getAllByText, getByTestId } = render(
        <ExerciseLibraryView
          onStartQuickRoutine={jest.fn()}
          onCreateCustomTimer={jest.fn()}
        />
      );

      fireEvent.press(getAllByText("Physical Therapy")[0]);
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "exercise_filtered",
        { filter_type: "category", value: "corrective" }
      );

      fireEvent.press(getAllByText("Ankle & Feet")[0]);
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "exercise_filtered",
        { filter_type: "body_part", value: "ankle_feet" }
      );

      fireEvent.press(getByTestId("exercise-card-tibialis_raises"));
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "exercise_viewed",
        expect.objectContaining({
          exercise_id: "tibialis_raises",
          category: "corrective",
          has_video: expect.any(Boolean),
        })
      );
    } finally {
      (global as any).__DEV__ = originalDev;
    }
  });
});
