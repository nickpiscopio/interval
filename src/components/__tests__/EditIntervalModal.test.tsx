import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { EditIntervalModal } from "../EditIntervalModal";
import { Interval } from "../../model/Interval";

describe("EditIntervalModal", () => {
  const sampleInterval: Interval = {
    id: "int-1",
    name: "Jumping Jacks",
    duration: 45,
    color: "#3B82F6",
  };

  it("returns null when interval is not provided", () => {
    const { toJSON } = render(
      <EditIntervalModal
        visible={true}
        interval={null}
        onClose={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onOpenExercisePicker={jest.fn()}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders interval details and triggers updates, exercise picker, and actions", async () => {
    const onClose = jest.fn();
    const onUpdate = jest.fn();
    const onDelete = jest.fn();
    const onDuplicate = jest.fn();
    const onOpenExercisePicker = jest.fn();

    const { getByText, getByDisplayValue, getByPlaceholderText, getByTestId } = render(
      <EditIntervalModal
        visible={true}
        interval={sampleInterval}
        onClose={onClose}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onOpenExercisePicker={onOpenExercisePicker}
      />
    );

    expect(getByText("Edit Interval")).toBeTruthy();
    expect(getByText("Done")).toBeTruthy();

    // Edit Name
    const nameInput = getByPlaceholderText("Interval name");
    fireEvent.changeText(nameInput, "High Knees");
    expect(onUpdate).toHaveBeenCalledWith({ name: "High Knees" });

    // Open Library Picker
    const libraryBtn = getByText("Library");
    fireEvent.press(libraryBtn);
    expect(onOpenExercisePicker).toHaveBeenCalled();

    // Duration Shift Register
    const durationInput = getByDisplayValue("00:00:45");
    fireEvent.changeText(durationInput, "30");
    expect(onUpdate).toHaveBeenCalledWith({ duration: 30 });

    // Change duration to 0 and blur
    fireEvent.changeText(durationInput, "0");
    fireEvent(durationInput, "blur");
    expect(onUpdate).toHaveBeenCalledWith({ duration: 0 });

    // Clear duration
    fireEvent.changeText(durationInput, "");
    expect(onUpdate).toHaveBeenCalledWith({ duration: -1 });

    // Select Color
    const checkmark = getByTestId("icon-checkmark");
    fireEvent.press(checkmark);
    expect(onUpdate).toHaveBeenCalledWith({ color: "#3B82F6" });

    // Duplicate Action
    const duplicateBtn = getByTestId("icon-copy-outline");
    fireEvent.press(duplicateBtn);
    expect(onDuplicate).toHaveBeenCalled();

    // Delete Action
    const deleteBtn = getByTestId("icon-trash-outline");
    fireEvent.press(deleteBtn);
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });

    // Done Action
    const doneBtn = getByText("Done");
    fireEvent.press(doneBtn);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("renders dynamic sequenceNumber placeholder and duration placeholder for new interval", () => {
    const { getByPlaceholderText } = render(
      <EditIntervalModal
        visible={true}
        interval={{ id: "new-1", name: "", duration: -1, color: "#1ACC6C" }}
        sequenceNumber={3}
        onClose={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onOpenExercisePicker={jest.fn()}
      />
    );

    expect(getByPlaceholderText("Interval 3")).toBeTruthy();
    expect(getByPlaceholderText("00:00:30")).toBeTruthy();
  });
});
