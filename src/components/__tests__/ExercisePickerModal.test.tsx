import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ExercisePickerModal } from "../ExercisePickerModal";

describe("ExercisePickerModal Component", () => {
  it("renders when visible and displays search bar and category tabs", () => {
    const { getByPlaceholderText, getByText, getAllByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    expect(getByPlaceholderText("Search exercises...")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
    expect(getAllByText("Cardio").length).toBeGreaterThan(0);
    expect(getByText("Jumping Jacks")).toBeTruthy();
  });

  it("filters exercises by search query", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const searchInput = getByPlaceholderText("Search exercises...");
    fireEvent.changeText(searchInput, "burpee");

    expect(getByText("Burpees")).toBeTruthy();
    expect(queryByText("Jumping Jacks")).toBeNull();
  });

  it("filters exercises by category chip", () => {
    const { getByText, getAllByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const upperCategory = getByText("Upper Body");
    fireEvent.press(upperCategory);

    expect(getByText("Push-Ups")).toBeTruthy();
  });

  it("calls onSelect and onClose when exercise is tapped", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { getByText } = render(
      <ExercisePickerModal visible={true} onClose={onClose} onSelect={onSelect} />
    );

    const exerciseItem = getByText("Jumping Jacks");
    fireEvent.press(exerciseItem);

    expect(onSelect).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("displays empty state when no search matches", () => {
    const { getByPlaceholderText, getByText } = render(
      <ExercisePickerModal visible={true} onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const searchInput = getByPlaceholderText("Search exercises...");
    fireEvent.changeText(searchInput, "xyznonexistent123");

    expect(getByText("No exercises found")).toBeTruthy();
  });
});
