import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateTimerScreen from "../CreateTimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";

import FontSize from "../../constants/FontSize";

function renderCreateTimerScreen(routeParams?: { timer?: Timer }) {
  const mockNavigation: any = {
    setOptions: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
    popToTop: jest.fn(),
  };

  const utils = render(
    <AlertProvider>
      <CreateTimerScreen
        navigation={mockNavigation}
        route={(routeParams ? { params: routeParams } : {}) as any}
      />
    </AlertProvider>
  );

  return { ...utils, mockNavigation };
}

describe("CreateTimerScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders with default intervals in create mode", () => {
    const { getByText, getByPlaceholderText, getByTestId } =
      renderCreateTimerScreen();

    expect(getByPlaceholderText("Morning Blast")).toBeTruthy();
    const nameLabel = getByText("Name");
    expect(nameLabel).toBeTruthy();
    const labelStyle = StyleSheet.flatten(nameLabel.props.style);
    expect(labelStyle.fontFamily).toBe("Poppins-Bold");
    expect(labelStyle.marginBottom).toBe(4);
    expect(getByText("Timer Details")).toBeTruthy();
    expect(getByText("High Interval")).toBeTruthy();
    expect(getByText("Low Interval")).toBeTruthy();

    const addIntervalText = getByText("Add Interval");
    expect(addIntervalText).toBeTruthy();
    const addIntervalStyle = StyleSheet.flatten(addIntervalText.props.style);
    expect(addIntervalStyle.fontSize).toBe(FontSize.sm);
    expect(addIntervalStyle.fontFamily).toBe("Poppins-Bold");

    const bottomContainer = getByTestId("bottom-docked-container");
    const bottomContainerStyle = StyleSheet.flatten(bottomContainer.props.style);
    expect(bottomContainerStyle.paddingTop).toBe(0);

    const totalTimeBadge = getByTestId("timer-total-time-badge");
    expect(totalTimeBadge.props.accessibilityLabel).toBe("Total Time: 2m 15s");
    expect(getByText("2m 15s")).toBeTruthy();
  });

  it("validates empty timer name on save and on start", () => {
    const { getByText, getByTestId } = renderCreateTimerScreen();

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);
    expect(getByText("Please enter a name for your timer.")).toBeTruthy();

    const playBtn = getByTestId("icon-play");
    fireEvent.press(playBtn);
    expect(getByText("Please enter a name for your timer.")).toBeTruthy();
  });

  it("saves valid timer to AsyncStorage and navigates back", async () => {
    const { getByPlaceholderText, getByTestId, mockNavigation } =
      renderCreateTimerScreen();

    const nameInput = getByPlaceholderText("Morning Blast");
    fireEvent.changeText(nameInput, "Core Crusher");

    // Adjust rounds
    const addRoundBtn = getByTestId("icon-add");
    fireEvent.press(addRoundBtn);

    const minusRoundBtn = getByTestId("icon-remove");
    fireEvent.press(minusRoundBtn);

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });

    const stored = await AsyncStorage.getItem("@hiit_timers");
    expect(stored).toContain("Core Crusher");
  });

  it("starts workout directly when play button is pressed", () => {
    const { getByTestId, getByPlaceholderText, mockNavigation } =
      renderCreateTimerScreen();

    const nameInput = getByPlaceholderText("Morning Blast");
    fireEvent.changeText(nameInput, "Instant Workout");

    const playBtn = getByTestId("icon-play");
    fireEvent.press(playBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "Timer",
      expect.objectContaining({
        timer: expect.objectContaining({
          name: "Instant Workout",
        }),
      })
    );
  });

  it("opens Edit Interval bottom sheet modal when tapping an interval and dismisses with Done", async () => {
    const { getByText, getByTestId, queryByText } = renderCreateTimerScreen();

    // Tap Low Interval to open bottom sheet
    const lowInterval = getByText("Low Interval");
    fireEvent.press(lowInterval);

    expect(getByText("Edit Interval")).toBeTruthy();
    // Tap Done checkmark button to close modal
    const doneBtn = getByTestId("edit-interval-done-btn");
    fireEvent.press(doneBtn);

    await waitFor(() => {
      expect(queryByText("Edit Interval")).toBeNull();
    });
  });

  it("duplicates interval, deletes interval, and warns when trying to delete last interval", async () => {
    const {
      getByText,
      getByPlaceholderText,
      getByTestId,
      getAllByTestId,
      queryByText,
    } = renderCreateTimerScreen();

    // Add new interval -> opens modal in draft mode
    const addIntervalBtn = getByText("Add Interval");
    fireEvent.press(addIntervalBtn);

    expect(getByText("Edit Interval")).toBeTruthy();
    // Verify interval is NOT added to the list until saved
    expect(queryByText("Interval 3")).toBeNull();

    // If duration is 0, duplicate warns and prevents duplication
    const durationInput = getByPlaceholderText("00:00:30");
    fireEvent.changeText(durationInput, "0");
    fireEvent(durationInput, "blur");

    const duplicateBtn = getByTestId("icon-copy-outline");
    fireEvent.press(duplicateBtn);
    expect(getByText("All intervals must have a duration greater than 0.")).toBeTruthy();
    // Dismiss alert
    fireEvent.press(getByText("OK"));

    // Reset duration to valid and duplicate
    fireEvent.changeText(durationInput, "30");
    fireEvent(durationInput, "blur");
    fireEvent.press(duplicateBtn);

    // Close modal
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(getByText("Interval 3 (Copy)")).toBeTruthy();
      expect(getByText("Interval 3")).toBeTruthy();
    });

    // Reopen modal on duplicated item and delete it
    fireEvent.press(getByText("Interval 3 (Copy)"));
    const trashBtn = getByTestId("icon-trash-outline");
    fireEvent.press(trashBtn);
    await waitFor(() => {
      expect(queryByText("Interval 3 (Copy)")).toBeNull();
    });

    // Open and delete Low Interval
    fireEvent.press(getByText("Low Interval"));
    fireEvent.press(getByTestId("icon-trash-outline"));

    // Open and delete High Interval
    await waitFor(() => {
      expect(getByText("High Interval")).toBeTruthy();
    });
    fireEvent.press(getByText("High Interval"));
    fireEvent.press(getByTestId("icon-trash-outline"));

    // Open remaining Interval 3 and try deleting last one -> triggers warning
    await waitFor(() => {
      expect(getByText("Interval 3")).toBeTruthy();
    });
    fireEvent.press(getByText("Interval 3"));
    fireEvent.press(getByTestId("icon-trash-outline"));
    expect(getByText("Please add at least one interval.")).toBeTruthy();

    const dragHandles = getAllByTestId("icon-drag-indicator");
    if (dragHandles.length > 0) {
      fireEvent(dragHandles[0], "pressIn");
    }
  });

  it("opens exercise library picker modal and selects exercise", async () => {
    const { getByText, getByDisplayValue, getByTestId } =
      renderCreateTimerScreen();

    // Open bottom sheet
    fireEvent.press(getByText("High Interval"));

    const libraryBtn = getByText("Library");
    fireEvent.press(libraryBtn);

    expect(getByText("Tibialis Raises")).toBeTruthy();
    const item = getByText("Tibialis Raises");
    fireEvent.press(item);

    expect(getByText("Add to Timer")).toBeTruthy();
    const addBtn = getByText("Add to Timer");
    fireEvent.press(addBtn);

    await waitFor(() => {
      expect(getByDisplayValue("Tibialis Raises")).toBeTruthy();
    });

    // Change interval name manually
    const intervalNameInput = getByDisplayValue("Tibialis Raises");
    fireEvent.changeText(intervalNameInput, "Burpees Warmup");

    // Change duration
    const durationInput = getByDisplayValue("00:00:30");
    fireEvent.changeText(durationInput, "000045");
    fireEvent(durationInput, "blur");

    // Select color
    const checkmark = getByTestId("icon-checkmark");
    fireEvent.press(checkmark);

    // Tap Done checkmark button
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(getByText("Burpees Warmup")).toBeTruthy();
    });
  });

  it("handles edit mode with existing timer and allows full deletion", async () => {
    const mockTimer: Timer = {
      id: "timer-edit-1",
      name: "Existing Workout",
      rounds: 4,
      createdAt: 123456789,
      intervals: [
        { id: "i1", name: "Push-Ups", duration: 40, color: "#3B82F6" },
      ],
    };
    await AsyncStorage.setItem("@hiit_timers", JSON.stringify([mockTimer]));

    const { getByDisplayValue, getByText, getByTestId, mockNavigation } =
      renderCreateTimerScreen({ timer: mockTimer });

    expect(getByDisplayValue("Existing Workout")).toBeTruthy();
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 40s"
    );
    expect(getByText("2m 40s")).toBeTruthy();

    // Delete existing timer via trash icon in timer actions
    const trashIcon = getByTestId("icon-trash-outline");
    fireEvent.press(trashIcon);

    expect(getByText("Delete Timer")).toBeTruthy();
    const confirmDeleteBtn = getByText("Delete");
    fireEvent.press(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });
  });

  it("handles import mode from shared AI timer and saves", async () => {
    const importedTimer: Timer = {
      id: "ai_imported_999",
      name: "Shared AI HIIT",
      rounds: 3,
      intervals: [
        { id: "int1", name: "Squats", duration: 20, color: "#10B981" },
      ],
    };

    const { getByText, getByDisplayValue, getByTestId, mockNavigation } =
      renderCreateTimerScreen({ timer: importedTimer });

    expect(getByDisplayValue("Shared AI HIIT")).toBeTruthy();
    expect(getByText("Review & Import Shared Timer")).toBeTruthy();
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 1m"
    );
    expect(getByText("1m")).toBeTruthy();

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });
  });

  it("handles right-to-left 6-digit shift register for duration input in bottom sheet", async () => {
    const { getByDisplayValue, getByText, getByTestId } =
      renderCreateTimerScreen();

    // Open Low Interval modal (15s) -> "00:00:15"
    fireEvent.press(getByText("Low Interval"));
    const lowDurationInput = getByDisplayValue("00:00:15");

    // Type 055832 -> "05:58:32"
    fireEvent.changeText(lowDurationInput, "055832");
    expect(getByDisplayValue("05:58:32")).toBeTruthy();

    // Tap Done checkmark button
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(getByText("5h 58m 32s")).toBeTruthy();
    });
  });

  it("saves newly generated AI preview timer to AsyncStorage and navigates", async () => {
    const generatedTimer: Timer = {
      id: "ai_generated_12345",
      name: "AI Fat Burn",
      rounds: 4,
      createdAt: Date.now(),
      isAiGenerated: true,
      intervals: [
        { id: "ai_int_1", name: "Jumping Jacks", duration: 30, color: "#1ACC6C" },
      ],
    };

    const { getByTestId, mockNavigation } = renderCreateTimerScreen({
      timer: generatedTimer,
    });

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);

    await waitFor(async () => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
      const data = await AsyncStorage.getItem("@hiit_timers");
      expect(data).toBeTruthy();
      const timers: Timer[] = JSON.parse(data!);
      expect(timers.some((t) => t.id === "ai_generated_12345")).toBe(true);
    });
  });

  it("navigates back when header back button is pressed", () => {
    const { getByTestId, mockNavigation } = renderCreateTimerScreen();

    const backBtn = getByTestId("header-back-button");
    const style = StyleSheet.flatten(backBtn.props.style);
    expect(style.marginLeft).toBe(-10);
    fireEvent.press(backBtn);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("handles deferred new interval lifecycle: discard on delete, discard on 0 duration, and save with default placeholders", async () => {
    const { getByText, getByPlaceholderText, getByTestId, queryByText } =
      renderCreateTimerScreen();

    // 1. Add interval and discard using delete button
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 15s"
    );
    fireEvent.press(getByText("Add Interval"));
    expect(getByText("Edit Interval")).toBeTruthy();
    expect(getByPlaceholderText("Interval 3")).toBeTruthy();
    // Draft interval does not change Total Time while uncommitted
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 15s"
    );
    fireEvent.press(getByTestId("icon-trash-outline"));
    await waitFor(() => {
      expect(queryByText("Edit Interval")).toBeNull();
      expect(queryByText("Interval 3")).toBeNull();
      expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
        "Total Time: 2m 15s"
      );
    });

    // 2. Add interval, set duration to 0 and tap Done checkmark -> discarded
    fireEvent.press(getByText("Add Interval"));
    const durationInput = getByPlaceholderText("00:00:30");
    fireEvent.changeText(durationInput, "0");
    fireEvent(durationInput, "blur");
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(queryByText("Edit Interval")).toBeNull();
      expect(queryByText("Interval 3")).toBeNull();
      expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
        "Total Time: 2m 15s"
      );
    });

    // 3. Add interval, tap Done checkmark with untouched defaults -> added as Interval 3 (30s)
    fireEvent.press(getByText("Add Interval"));
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 15s"
    );
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(getByText("Interval 3")).toBeTruthy();
      expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
        "Total Time: 3m 45s"
      );
      expect(getByText("3m 45s")).toBeTruthy();
    });

    // 4. Edit existing Interval 3, clear name, and tap Done checkmark -> falls back to Interval 3
    fireEvent.press(getByText("Interval 3"));
    const nameInput = getByPlaceholderText("Interval 3");
    fireEvent.changeText(nameInput, "");
    fireEvent.press(getByTestId("edit-interval-done-btn"));
    await waitFor(() => {
      expect(getByText("Interval 3")).toBeTruthy();
    });
  });

  it("updates Total Time badge and accessibilityLabel when incrementing and decrementing rounds", () => {
    const { getByTestId, getByText } = renderCreateTimerScreen();

    const badge = getByTestId("timer-total-time-badge");
    expect(badge.props.accessibilityLabel).toBe("Total Time: 2m 15s");
    expect(getByText("2m 15s")).toBeTruthy();

    // Increment rounds: 3 -> 4 (4 * 45s = 180s = 3m)
    fireEvent.press(getByTestId("icon-add"));
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 3m"
    );
    expect(getByText("3m")).toBeTruthy();

    // Decrement rounds: 4 -> 3 -> 2 -> 1 (1 * 45s = 45s)
    const minusRoundBtn = getByTestId("icon-remove");
    fireEvent.press(minusRoundBtn);
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 15s"
    );
    fireEvent.press(minusRoundBtn);
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 1m 30s"
    );
    fireEvent.press(minusRoundBtn);
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 45s"
    );
    // Clamped at minimum 1 round
    fireEvent.press(minusRoundBtn);
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 45s"
    );
  });

  it("updates Total Time badge when editing, duplicating, and deleting an interval", async () => {
    const { getByTestId, getByText, getByDisplayValue } =
      renderCreateTimerScreen();

    // Default: 3 rounds * (30s + 15s) = 2m 15s
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 2m 15s"
    );

    // Edit Low Interval duration from 15s to 30s -> 3 * (30s + 30s) = 3m
    fireEvent.press(getByText("Low Interval"));
    const lowDurationInput = getByDisplayValue("00:00:15");
    fireEvent.changeText(lowDurationInput, "000030");
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 3m"
    );

    // Duplicate Low Interval (30s) -> 3 * (30s + 30s + 30s) = 4m 30s
    fireEvent.press(getByTestId("icon-copy-outline"));
    expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
      "Total Time: 4m 30s"
    );
    expect(getByText("4m 30s")).toBeTruthy();

    // Delete the duplicated interval -> 3 * (30s + 30s) = 3m
    fireEvent.press(getByTestId("icon-trash-outline"));
    await waitFor(() => {
      expect(getByTestId("timer-total-time-badge").props.accessibilityLabel).toBe(
        "Total Time: 3m"
      );
      expect(getByText("3m")).toBeTruthy();
    });
  });
});
