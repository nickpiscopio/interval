import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ExercisePickerModal } from "../ExercisePickerModal";

describe("ExercisePickerModal Component", () => {
  it("renders when visible and displays search bar and self-describing filter pills without section labels", () => {
    const { getByPlaceholderText, getByText, getAllByText, queryByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    expect(getByPlaceholderText("Search exercises...")).toBeTruthy();
    expect(queryByText("Category")).toBeNull();
    expect(queryByText("Body Part")).toBeNull();
    expect(getByText("All Categories")).toBeTruthy();
    expect(getByText("All Body Parts")).toBeTruthy();
    expect(getAllByText("Cardio").length).toBeGreaterThan(0);
    expect(getByText("Tibialis Raises")).toBeTruthy();
  });

  it("filters exercises by search query", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const searchInput = getByPlaceholderText("Search exercises...");
    fireEvent.changeText(searchInput, "burpee");

    expect(getByText("Burpees")).toBeTruthy();
    expect(queryByText("Tibialis Raises")).toBeNull();
  });

  it("filters exercises by category and body part chip", () => {
    const { getByText, getAllByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const upperCategory = getByText("Upper Body");
    fireEvent.press(upperCategory);
    expect(getByText("Push-Ups")).toBeTruthy();

    const ptCategory = getByText("Physical Therapy");
    fireEvent.press(ptCategory);
    expect(getByText("Tibialis Raises")).toBeTruthy();

    const allBodyParts = getByText("All Body Parts");
    fireEvent.press(allBodyParts);

    const ankleChip = getAllByText("Ankle & Feet")[0];
    fireEvent.press(ankleChip);
    expect(getByText("Tibialis Raises")).toBeTruthy();
  });

  it("opens detail modal and calls onSelect and onClose when Add to Timer is pressed", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { getByText } = render(
      <ExercisePickerModal visible={true} onClose={onClose} onSelect={onSelect} />
    );

    const exerciseItem = getByText("Tibialis Raises");
    fireEvent.press(exerciseItem);

    expect(getByText("Add to Timer")).toBeTruthy();
    const addBtn = getByText("Add to Timer");
    fireEvent.press(addBtn);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("allows 1-tap quick add directly from exercise card", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { getByTestId } = render(
      <ExercisePickerModal visible={true} onClose={onClose} onSelect={onSelect} />
    );

    const quickAddBtn = getByTestId("btn-quick-add-tibialis_raises");
    fireEvent.press(quickAddBtn);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: "tibialis_raises", name: "Tibialis Raises" })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("navigates back from detail view to catalog list", () => {
    const { getByText, getByTestId, queryByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    fireEvent.press(getByText("Tibialis Raises"));
    expect(getByText("Add to Timer")).toBeTruthy();

    fireEvent.press(getByTestId("exercise-detail-back-btn"));
    expect(queryByText("Add to Timer")).toBeNull();
    expect(getByText("Tibialis Raises")).toBeTruthy();
  });

  it("displays empty state when no search matches", () => {
    const { getByPlaceholderText, getByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const searchInput = getByPlaceholderText("Search exercises...");
    fireEvent.changeText(searchInput, "xyznonexistent123");

    expect(getByText("No exercises found")).toBeTruthy();
  });

  it("renders Exercise Detail in-place within the single bottom sheet with 16px padding and closes on Add to Timer", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { getByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <ExercisePickerModal visible={true} onClose={onClose} onSelect={onSelect} />
    );

    expect(getAllByTestId("bottom-sheet-modal")).toHaveLength(1);

    fireEvent.press(getByText("Tibialis Raises"));

    // Still strictly a single bottom sheet mounted
    expect(getAllByTestId("bottom-sheet-modal")).toHaveLength(1);
    expect(getByTestId("exercise-detail-header")).toBeTruthy();
    expect(queryByTestId("exercise-search-bar")).toBeNull();

    const detailContainerStyle = StyleSheet.flatten(
      getByTestId("exercise-detail-sheet-container").props.style
    );
    expect(detailContainerStyle.paddingTop).toBe(16);
    expect(detailContainerStyle.paddingHorizontal).toBe(16);

    fireEvent.press(getByTestId("exercise-detail-add-to-timer-btn"));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: "tibialis_raises", name: "Tibialis Raises" })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
