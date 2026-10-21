import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { EditIntervalModal } from "../EditIntervalModal";
import { Interval } from "../../model/Interval";
import { StyleSheet, BackHandler } from "react-native";
import Spacing, { TOUCH_TARGET } from "../../constants/Spacing";
import Colors from "../../constants/Colors";
import FontSize from "../../constants/FontSize";

const styleOf = (el: any) => StyleSheet.flatten(el.props.style) ?? {};

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
    expect(getByTestId("edit-interval-done-btn")).toBeTruthy();
    const doneIcon = getByTestId("edit-interval-done-icon");
    expect(doneIcon.props.children).toBe("checkmark-sharp");
    expect(doneIcon.props.size).toBe(24);

    // Section title
    expect(getByText("Interval Name")).toBeTruthy();

    // Edit Name
    const nameInput = getByPlaceholderText("Interval name");
    fireEvent.changeText(nameInput, "High Knees");
    expect(onUpdate).toHaveBeenCalledWith({ name: "High Knees" });

    // Open Library Picker
    const libraryBtn = getByText("Library");
    fireEvent.press(libraryBtn);
    expect(onOpenExercisePicker).toHaveBeenCalled();
    fireEvent.press(getByTestId("exercise-picker-back-btn"));

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

    // Done Action via Checkmark Button
    const doneBtn = getByTestId("edit-interval-done-btn");
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

  it("renders sound pills without speaker or checkmark icons and highlights selected with active tinting", () => {
    const { getByText, getByTestId, queryByTestId } = setup(base);
    expect(getByText("Interval Sound")).toBeTruthy();
    expect(getByText("Beep")).toBeTruthy();
    expect(getByText("Triple Beep")).toBeTruthy();
    expect(getByText("None")).toBeTruthy();

    // Checkmark icons should not be present
    expect(queryByTestId("sound-checkmark-beep")).toBeNull();
    expect(queryByTestId("sound-checkmark-beep_3")).toBeNull();
    expect(queryByTestId("sound-checkmark-none")).toBeNull();

    // Active pill styling (AI Workout Generator style)
    const beepPill = styleOf(getByTestId("sound-pill-beep"));
    expect(beepPill.borderWidth).toBe(1.5);
    expect(beepPill.borderColor).toBe(Colors.primary);
    expect(beepPill.backgroundColor).toBe(Colors.surface.tintActive);

    const beepText = styleOf(getByTestId("sound-pill-text-beep"));
    expect(beepText.fontFamily).toBe("Poppins-Bold");
    expect(beepText.color).toBe(Colors.primary);

    // Resting pill styling
    const nonePill = styleOf(getByTestId("sound-pill-none"));
    expect(nonePill.borderWidth).toBe(1.5);
    expect(nonePill.borderColor).toBe(Colors.borderInput);
    expect(nonePill.backgroundColor).toBe(Colors.surface.card);

    const noneText = styleOf(getByTestId("sound-pill-text-none"));
    expect(noneText.fontFamily).toBe("Poppins-Medium");
    expect(noneText.color).toBe(Colors.textScale.primary);
  });

  it("highlights stored sound with active pill styling", () => {
    const { getByTestId } = setup({ ...base, sound: "none" });
    const nonePill = styleOf(getByTestId("sound-pill-none"));
    expect(nonePill.borderColor).toBe(Colors.primary);
    expect(nonePill.backgroundColor).toBe(Colors.surface.tintActive);

    const beepPill = styleOf(getByTestId("sound-pill-beep"));
    expect(beepPill.borderColor).toBe(Colors.borderInput);
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

describe("EditIntervalModal sheet spacing & layout refinement", () => {
  const interval = { id: "int-1", name: "Work", duration: 30, color: "#3B82F6" };

  function renderSheet() {
    return render(
      <EditIntervalModal
        visible={true}
        interval={interval}
        onClose={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onOpenExercisePicker={jest.fn()}
      />
    );
  }

  it("separates the header from the form by 16px and renders a 44x44 checkmark button", () => {
    const { getByTestId } = renderSheet();
    expect(styleOf(getByTestId("edit-interval-header")).marginBottom).toBe(Spacing.md);

    const doneTouchable = getByTestId("edit-interval-done-btn");
    const doneBtn = styleOf(doneTouchable);
    expect(doneBtn.width).toBe(TOUCH_TARGET.icon);
    expect(doneBtn.height).toBe(TOUCH_TARGET.icon);
    expect(doneBtn.marginRight).toBe(-10);
    expect(doneTouchable.props.hitSlop).toBeUndefined();
    expect(getByTestId("edit-interval-done-icon").props.children).toBe("checkmark-sharp");
  });

  it("separates sections by 24px and gives actions bottom margin", () => {
    const { getByTestId } = renderSheet();
    expect(styleOf(getByTestId("edit-interval-input-row")).marginBottom).toBe(Spacing.lg);
    expect(styleOf(getByTestId("edit-interval-color-palette")).marginBottom).toBe(Spacing.lg);
    expect(styleOf(getByTestId("edit-interval-sound-palette")).marginBottom).toBe(Spacing.lg);
    expect(styleOf(getByTestId("edit-interval-actions")).marginTop ?? 0).toBe(0);
    expect(styleOf(getByTestId("edit-interval-actions")).marginBottom).toBe(Spacing.xs);
  });

  it("bolds section titles in Title Case with Poppins-Bold", () => {
    const { getByTestId } = renderSheet();
    const nameLabel = getByTestId("edit-interval-name-label");
    const durationLabel = getByTestId("edit-interval-duration-label");
    const colorLabel = getByTestId("edit-interval-color-label");
    const soundLabel = getByTestId("edit-interval-sound-label");

    expect(nameLabel.props.children).toBe("Interval Name");
    expect(durationLabel.props.children).toBe("Duration");
    expect(colorLabel.props.children).toBe("Interval Color");
    expect(soundLabel.props.children).toBe("Interval Sound");

    for (const label of [nameLabel, durationLabel, colorLabel, soundLabel]) {
      const s = styleOf(label);
      expect(s.fontFamily).toBe("Poppins-Bold");
    }
  });

  it("normalizes label rows so name and duration inputs align vertically without duplicate margins", () => {
    const { getByTestId } = renderSheet();
    const nameLabelRow = styleOf(getByTestId("edit-interval-name-label-row"));
    const durationLabelRow = styleOf(getByTestId("edit-interval-duration-label-row"));

    expect(nameLabelRow.marginBottom).toBe(Spacing.sm);
    expect(durationLabelRow.marginBottom).toBe(Spacing.sm);
    expect(nameLabelRow.minHeight).toBe(20);
    expect(durationLabelRow.minHeight).toBe(20);

    const nameLabel = styleOf(getByTestId("edit-interval-name-label"));
    const durationLabel = styleOf(getByTestId("edit-interval-duration-label"));
    expect(nameLabel.marginBottom ?? 0).toBe(0);
    expect(durationLabel.marginBottom ?? 0).toBe(0);
  });

  it("gives the interval name input 16px horizontal inner padding", () => {
    const { getByTestId } = renderSheet();
    const nameInput = styleOf(getByTestId("edit-interval-name-input"));
    const durationInput = styleOf(getByTestId("edit-interval-duration-input"));

    expect(nameInput.paddingHorizontal).toBe(Spacing.md);
    expect(durationInput.paddingHorizontal).toBe(Spacing.sm);
  });

  it("adds no inner padding to palettes and gaps sound pills by 8px", () => {
    const { getByTestId } = renderSheet();
    const color = styleOf(getByTestId("edit-interval-color-palette"));
    const sound = styleOf(getByTestId("edit-interval-sound-palette"));
    for (const s of [color, sound]) {
      expect(s.paddingHorizontal).toBeUndefined();
      expect(s.paddingVertical).toBeUndefined();
    }
    expect(sound.gap).toBe(Spacing.sm);
  });

  it("styles library button with 4px gap and -1px offsets on the dumbbell icon", () => {
    const { getByTestId } = renderSheet();
    const libraryBtn = styleOf(getByTestId("edit-interval-library-btn"));
    expect(libraryBtn.gap).toBe(4);

    const icon = getByTestId("icon-barbell-outline");
    const iconStyle = styleOf(icon);
    expect(iconStyle.transform).toEqual([{ translateY: -1 }, { translateX: -1 }]);
  });

  it("applies safe-area-aware bottom padding on the scroll container and bottom margin on action buttons", () => {
    const { getByTestId } = renderSheet();
    const sheet = getByTestId("edit-interval-sheet");
    const contentStyle = StyleSheet.flatten(sheet.props.contentContainerStyle);
    // In jest.setup, insets.bottom = 34. 34 + Spacing.lg (24) = 58.
    expect(contentStyle.paddingBottom).toBe(34 + Spacing.lg);

    const actions = styleOf(getByTestId("edit-interval-actions"));
    expect(actions.marginBottom).toBe(Spacing.xs);
  });

  it("navigates into library in the same bottom sheet and returns via back button", () => {
    const { getByText, getByTestId, queryByTestId } = renderSheet();
    expect(getByTestId("edit-interval-header")).toBeTruthy();

    // Tap Library
    fireEvent.press(getByText("Library"));

    // Library view displayed inside same sheet with 90% snap point and no close button
    expect(queryByTestId("edit-interval-header")).toBeNull();
    expect(getByTestId("exercise-picker-back-btn")).toBeTruthy();
    expect(queryByTestId("exercise-picker-close-btn")).toBeNull();
    expect(getByText("Tibialis Raises")).toBeTruthy();

    const modal = getByTestId("bottom-sheet-modal");
    expect(modal.props.sheetProps.snapPoints).toEqual(["90%"]);

    // Tap back button
    fireEvent.press(getByTestId("exercise-picker-back-btn"));

    // Returns to Edit Interval view
    expect(getByTestId("edit-interval-header")).toBeTruthy();
    expect(queryByTestId("exercise-picker-back-btn")).toBeNull();
  });

  it("selects exercise from in-sheet library and returns to edit form", () => {
    const onUpdate = jest.fn();
    const onSelectExercise = jest.fn();
    const { getByText, getByTestId } = render(
      <EditIntervalModal
        visible={true}
        interval={interval}
        onClose={jest.fn()}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onSelectExercise={onSelectExercise}
      />
    );

    fireEvent.press(getByText("Library"));
    const quickAddBtn = getByTestId("btn-quick-add-tibialis_raises");
    fireEvent.press(quickAddBtn);

    expect(onSelectExercise).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tibialis_raises", name: "Tibialis Raises" })
    );
    expect(getByTestId("edit-interval-header")).toBeTruthy();
  });

  it("returns from library mode to edit mode when hardware back button is pressed", () => {
    let backHandler: (() => boolean) | null = null;
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean;
      return { remove: jest.fn() } as any;
    });

    const { getByText, getByTestId, queryByTestId } = renderSheet();
    fireEvent.press(getByText("Library"));
    expect(queryByTestId("edit-interval-header")).toBeNull();

    // Trigger hardware back
    expect(backHandler).not.toBeNull();
    let consumed: boolean | undefined;
    act(() => {
      consumed = backHandler!();
    });
    expect(consumed).toBe(true);
    expect(getByTestId("edit-interval-header")).toBeTruthy();
  });
});



