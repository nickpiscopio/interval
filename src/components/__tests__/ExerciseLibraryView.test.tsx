import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ExerciseLibraryView } from "../ExerciseLibraryView";
import Spacing from "../../constants/Spacing";

describe("ExerciseLibraryView Component", () => {
  it("renders exercises and filters by category and body part", () => {
    const onQuickRoutine = jest.fn();
    const onCustomTimer = jest.fn();

    const { getByText, getAllByText, getByPlaceholderText } = render(
      <ExerciseLibraryView
        onStartQuickRoutine={onQuickRoutine}
        onCreateCustomTimer={onCustomTimer}
      />
    );

    expect(getByPlaceholderText("Search exercises, body parts, or instructions...")).toBeTruthy();
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by Physical Therapy category (first element is the filter pill)
    const ptPills = getAllByText("Physical Therapy");
    fireEvent.press(ptPills[0]);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by Ankle & Feet body part
    const anklePills = getAllByText("Ankle & Feet");
    fireEvent.press(anklePills[0]);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Filter by All Body Parts
    const allBodyPartsPill = getByText("All Body Parts");
    fireEvent.press(allBodyPartsPill);
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
});
