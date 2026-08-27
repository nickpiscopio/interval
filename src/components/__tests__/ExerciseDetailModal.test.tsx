import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ExerciseDetailModal } from "../ExerciseDetailModal";
import { Exercise } from "../../model/Exercise";

describe("ExerciseDetailModal Component", () => {
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

  it("returns null when exercise is null", () => {
    const { queryByText } = render(
      <ExerciseDetailModal
        visible={true}
        exercise={null}
        onClose={jest.fn()}
      />
    );
    expect(queryByText("Tibialis Raises")).toBeNull();
  });

  it("renders exercise details in picker mode and handles select action", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { getByText } = render(
      <ExerciseDetailModal
        visible={true}
        exercise={mockExercise}
        mode="picker"
        onClose={onClose}
        onSelectExercise={onSelect}
      />
    );

    expect(getByText("Tibialis Raises")).toBeTruthy();
    expect(getByText("Physical Therapy")).toBeTruthy();
    expect(getByText("Ankle & Feet")).toBeTruthy();
    expect(getByText("Tibialis Anterior")).toBeTruthy();
    expect(getByText("Strengthens shin muscles to absorb ground impact.")).toBeTruthy();
    expect(getByText("Stand with back flat against a wall.")).toBeTruthy();

    const addBtn = getByText("Add to Timer");
    fireEvent.press(addBtn);

    expect(onSelect).toHaveBeenCalledWith(mockExercise);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders in library mode and handles Quick Routine and Custom Workout actions", () => {
    const onQuickRoutine = jest.fn();
    const onCustomTimer = jest.fn();
    const onClose = jest.fn();

    const { getByText, getByTestId } = render(
      <ExerciseDetailModal
        visible={true}
        exercise={mockExercise}
        mode="library"
        onClose={onClose}
        onStartQuickRoutine={onQuickRoutine}
        onCreateCustomTimer={onCustomTimer}
      />
    );

    const quickBtn = getByText("Start Quick Routine");
    fireEvent.press(quickBtn);
    expect(onQuickRoutine).toHaveBeenCalledWith(mockExercise);
    expect(onClose).toHaveBeenCalled();

    const customBtn = getByText("Create Custom Workout");
    fireEvent.press(customBtn);
    expect(onCustomTimer).toHaveBeenCalledWith(mockExercise);

    const closeBtn = getByTestId("exercise-detail-close-btn");
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
