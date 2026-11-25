import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ExerciseDetailView } from "../ExerciseDetailView";
import { Exercise } from "../../model/Exercise";
import Spacing from "../../constants/Spacing";

describe("ExerciseDetailView Component", () => {
  const mockExercise: Exercise = {
    id: "tibialis_raises",
    name: "Tibialis Raises",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["ankle_feet", "knees"],
    targetMuscles: ["Tibialis Anterior", "Ankle Dorsiflexors"],
    description: "Strengthens shin muscles to absorb ground impact.",
    instructions: [
      "Stand with back flat against a wall.",
      "Pull toes and balls of feet up toward shins.",
      "Lower smoothly and repeat.",
    ],
  };

  it("renders exercise details in picker mode without mounting a bottom sheet modal", async () => {
    const onSelect = jest.fn();
    const onBack = jest.fn();

    const { getByText, queryByTestId } = render(
      <ExerciseDetailView
        exercise={mockExercise}
        mode="picker"
        onBack={onBack}
        onSelectExercise={onSelect}
      />
    );

    expect(queryByTestId("bottom-sheet-modal")).toBeNull();
    expect(getByText("Tibialis Raises")).toBeTruthy();
    expect(getByText("Physical Therapy")).toBeTruthy();
    expect(getByText("BEGINNER")).toBeTruthy();
    expect(getByText("Ankle & Feet")).toBeTruthy();
    expect(getByText("Tibialis Anterior")).toBeTruthy();
    expect(getByText("Strengthens shin muscles to absorb ground impact.")).toBeTruthy();
    expect(getByText("1. Stand with back flat against a wall.")).toBeTruthy();

    fireEvent.press(getByText("Add to Timer"));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(mockExercise);
      expect(onBack).toHaveBeenCalled();
    });
  });

  it("renders library mode actions and invokes callbacks with back navigation", async () => {
    const onQuickRoutine = jest.fn();
    const onCustomTimer = jest.fn();
    const onBack = jest.fn();

    const { getByText, getByTestId } = render(
      <ExerciseDetailView
        exercise={mockExercise}
        mode="library"
        onBack={onBack}
        onStartQuickRoutine={onQuickRoutine}
        onCreateCustomTimer={onCustomTimer}
      />
    );

    fireEvent.press(getByText("Start Quick Routine"));
    await waitFor(() => {
      expect(onQuickRoutine).toHaveBeenCalledWith(mockExercise);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByText("Create Custom Workout"));
    await waitFor(() => {
      expect(onCustomTimer).toHaveBeenCalledWith(mockExercise);
      expect(onBack).toHaveBeenCalledTimes(2);
    });

    const backBtn = getByTestId("exercise-detail-back-btn");
    expect(backBtn.props.style.backgroundColor).toBe("transparent");
    expect(backBtn.props.style.marginLeft).toBe(-10);

    fireEvent.press(backBtn);
    await waitFor(() => {
      expect(onBack).toHaveBeenCalledTimes(3);
    });
  });

  it("applies 16px top and horizontal padding only when inSheetPadding is true", () => {
    const { getByTestId, rerender } = render(
      <ExerciseDetailView
        exercise={mockExercise}
        mode="picker"
        onBack={jest.fn()}
      />
    );

    const defaultStyle = StyleSheet.flatten(
      getByTestId("exercise-detail-sheet-container").props.style
    );
    expect(defaultStyle.flex).toBe(1);
    expect(defaultStyle.paddingTop).toBeUndefined();
    expect(defaultStyle.paddingHorizontal).toBeUndefined();

    rerender(
      <ExerciseDetailView
        exercise={mockExercise}
        mode="picker"
        onBack={jest.fn()}
        inSheetPadding={true}
      />
    );

    const paddedStyle = StyleSheet.flatten(
      getByTestId("exercise-detail-sheet-container").props.style
    );
    expect(paddedStyle.flex).toBe(1);
    expect(paddedStyle.paddingTop).toBe(Spacing.md);
    expect(paddedStyle.paddingHorizontal).toBe(Spacing.md);
    expect(paddedStyle.paddingTop).toBe(16);
    expect(paddedStyle.paddingHorizontal).toBe(16);
  });
});
