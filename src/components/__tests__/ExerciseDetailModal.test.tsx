import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ExerciseDetailModal } from "../ExerciseDetailModal";
import { Exercise } from "../../model/Exercise";
import Spacing from "../../constants/Spacing";

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

  it("renders exercise details in picker mode and handles select action", async () => {
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
    expect(getByText("1. Stand with back flat against a wall.")).toBeTruthy();

    const addBtn = getByText("Add to Timer");
    fireEvent.press(addBtn);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(mockExercise);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("renders in library mode and handles Quick Routine and Custom Workout actions", async () => {
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
    await waitFor(() => {
      expect(onQuickRoutine).toHaveBeenCalledWith(mockExercise);
      expect(onClose).toHaveBeenCalled();
    });

    const customBtn = getByText("Create Custom Workout");
    fireEvent.press(customBtn);
    await waitFor(() => {
      expect(onCustomTimer).toHaveBeenCalledWith(mockExercise);
    });

    const backBtn = getByTestId("exercise-detail-back-btn");
    const backBtnStyle = backBtn.props.style;
    expect(backBtnStyle.backgroundColor).toBe("transparent");
    expect(backBtnStyle.marginLeft).toBe(-10);
    fireEvent.press(backBtn);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("renders header with back button on the left, exercise name adjacent, and badges beneath", () => {
    const { getByTestId, getByText } = render(
      <ExerciseDetailModal
        visible={true}
        exercise={mockExercise}
        mode="picker"
        onClose={jest.fn()}
      />
    );

    const header = getByTestId("exercise-detail-header");
    expect(header).toBeTruthy();

    const backBtn = getByTestId("exercise-detail-back-btn");
    expect(backBtn).toBeTruthy();

    const title = getByTestId("exercise-detail-title");
    expect(title.props.children).toBe("Tibialis Raises");

    const tagsRow = getByTestId("exercise-detail-tags-row");
    expect(tagsRow).toBeTruthy();
    expect(getByText("Physical Therapy")).toBeTruthy();
    expect(getByText("BEGINNER")).toBeTruthy();
  });

  it("formats section headings as canonical Input Labels and renders instructions as clean numbered text", () => {
    const { getByText, queryByText } = render(
      <ExerciseDetailModal
        visible={true}
        exercise={mockExercise}
        mode="picker"
        onClose={jest.fn()}
      />
    );

    const bodyPartHeading = getByText("Body Part Focus");
    const headingStyle = StyleSheet.flatten(bodyPartHeading.props.style);
    expect(headingStyle.fontFamily).toBe("Poppins-Bold");
    expect(headingStyle.fontSize).toBe(12);
    expect(headingStyle.marginBottom).toBe(Spacing.inputLabelGap);
    expect(headingStyle.textTransform).toBeUndefined();

    // Plain numbered instructions
    expect(getByText("1. Stand with back flat against a wall.")).toBeTruthy();
    expect(getByText("2. Pull toes and balls of feet up toward shins.")).toBeTruthy();
    expect(getByText("3. Lower smoothly and repeat.")).toBeTruthy();

    // Circular badge numbers are removed
    expect(queryByText("1")).toBeNull();
  });
});
