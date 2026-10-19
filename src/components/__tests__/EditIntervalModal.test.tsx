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

describe("EditIntervalModal sound picker", () => {
  const { createAudioPlayer } = require("expo-audio");
  const base = { id: "int-1", name: "Work", duration: 30, color: "#3B82F6" };

  function setup(interval: any, onUpdate = jest.fn()) {
    const utils = render(
      <EditIntervalModal
        visible={true}
        interval={interval}
        onClose={jest.fn()}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onOpenExercisePicker={jest.fn()}
      />
    );
    return { ...utils, onUpdate };
  }

  beforeEach(() => createAudioPlayer.mockClear());

  it("renders every sound plus None and checks Beep when absent", () => {
    const { getByText, getByTestId, queryByTestId } = setup(base);
    expect(getByText("Interval Sound")).toBeTruthy();
    expect(getByText("Beep")).toBeTruthy();
    expect(getByText("Triple Beep")).toBeTruthy();
    expect(getByText("None")).toBeTruthy();
    expect(getByTestId("sound-checkmark-beep")).toBeTruthy();
    expect(queryByTestId("sound-checkmark-beep_3")).toBeNull();
  });

  it("checks the stored sound", () => {
    const { getByTestId } = setup({ ...base, sound: "none" });
    expect(getByTestId("sound-checkmark-none")).toBeTruthy();
  });

  it("selects a sound and previews it", () => {
    const { getByText, onUpdate } = setup(base);
    fireEvent.press(getByText("Triple Beep"));
    expect(onUpdate).toHaveBeenCalledWith({ sound: "beep_3" });
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(createAudioPlayer.mock.results[0].value.play).toHaveBeenCalled();
  });

  it("selects None without a preview", () => {
    const { getByText, onUpdate } = setup(base);
    fireEvent.press(getByText("None"));
    expect(onUpdate).toHaveBeenCalledWith({ sound: "none" });
    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  it("releases the previous preview when replaced and on unmount", () => {
    const { getByText, unmount } = setup(base);
    fireEvent.press(getByText("Beep"));
    fireEvent.press(getByText("Triple Beep"));
    expect(createAudioPlayer.mock.results[0].value.release).toHaveBeenCalled();
    unmount();
    expect(createAudioPlayer.mock.results[1].value.release).toHaveBeenCalled();
  });
});
