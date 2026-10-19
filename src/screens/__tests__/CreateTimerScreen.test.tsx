import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateTimerScreen from "../CreateTimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { Timer } from "../../model/Timer";

describe("CreateTimerScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders with default intervals in create mode", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByPlaceholderText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    expect(getByPlaceholderText("Morning Blast")).toBeTruthy();
    expect(getByText("Timer Name")).toBeTruthy();
    expect(getByText("Timer Details")).toBeTruthy();
    expect(getByText("High Interval")).toBeTruthy();
    expect(getByText("Low Interval")).toBeTruthy();
  });

  it("validates empty timer name on save and on start", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);
    expect(getByText("Please enter a name for your timer.")).toBeTruthy();

    const playBtn = getByTestId("icon-play");
    fireEvent.press(playBtn);
    expect(getByText("Please enter a name for your timer.")).toBeTruthy();
  });

  it("saves valid timer to AsyncStorage and navigates back", async () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

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
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByTestId, getByPlaceholderText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

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
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // Tap Low Interval to open bottom sheet
    const lowInterval = getByText("Low Interval");
    fireEvent.press(lowInterval);

    expect(getByText("Edit Interval")).toBeTruthy();
    // Tap Done to close modal
    const doneBtn = getByText("Done");
    fireEvent.press(doneBtn);

    await waitFor(() => {
      expect(queryByText("Done")).toBeNull();
    });
  });

  it("duplicates interval, deletes interval, and warns when trying to delete last interval", async () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getAllByText, getByPlaceholderText, getByTestId, getAllByTestId, queryByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

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
    fireEvent.press(getByText("Done"));
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
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByDisplayValue, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

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

    // Tap Done
    fireEvent.press(getByText("Done"));
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

    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByDisplayValue, getByText, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByDisplayValue("Existing Workout")).toBeTruthy();

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

    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText, getByDisplayValue, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: importedTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByDisplayValue("Shared AI HIIT")).toBeTruthy();
    expect(getByText("Review & Import Shared Timer")).toBeTruthy();

    const saveBtn = getByTestId("icon-save-outline");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });
  });

  it("handles right-to-left 6-digit shift register for duration input in bottom sheet", async () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByDisplayValue, getByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // Open Low Interval modal (15s) -> "00:00:15"
    fireEvent.press(getByText("Low Interval"));
    const lowDurationInput = getByDisplayValue("00:00:15");

    // Type 055832 -> "05:58:32"
    fireEvent.changeText(lowDurationInput, "055832");
    expect(getByDisplayValue("05:58:32")).toBeTruthy();

    // Tap Done
    fireEvent.press(getByText("Done"));
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

    const mockNavigation: any = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: generatedTimer } } as any}
        />
      </AlertProvider>
    );

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
    const mockNavigation: any = {
      goBack: jest.fn(),
    };

    const { getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    const backBtn = getByTestId("header-back-button");
    fireEvent.press(backBtn);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("handles deferred new interval lifecycle: discard on delete, discard on 0 duration, and save with default placeholders", async () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // 1. Add interval and discard using delete button
    fireEvent.press(getByText("Add Interval"));
    expect(getByText("Edit Interval")).toBeTruthy();
    expect(getByPlaceholderText("Interval 3")).toBeTruthy();
    fireEvent.press(getByTestId("icon-trash-outline"));
    await waitFor(() => {
      expect(queryByText("Edit Interval")).toBeNull();
      expect(queryByText("Interval 3")).toBeNull();
    });

    // 2. Add interval, set duration to 0 and tap Done -> discarded
    fireEvent.press(getByText("Add Interval"));
    const durationInput = getByPlaceholderText("00:00:30");
    fireEvent.changeText(durationInput, "0");
    fireEvent(durationInput, "blur");
    fireEvent.press(getByText("Done"));
    await waitFor(() => {
      expect(queryByText("Edit Interval")).toBeNull();
      expect(queryByText("Interval 3")).toBeNull();
    });

    // 3. Add interval, tap Done with untouched defaults -> added as Interval 3 (30s)
    fireEvent.press(getByText("Add Interval"));
    fireEvent.press(getByText("Done"));
    await waitFor(() => {
      expect(getByText("Interval 3")).toBeTruthy();
    });

    // 4. Edit existing Interval 3, clear name, and tap Done -> falls back to Interval 3
    fireEvent.press(getByText("Interval 3"));
    const nameInput = getByPlaceholderText("Interval 3");
    fireEvent.changeText(nameInput, "");
    fireEvent.press(getByText("Done"));
    await waitFor(() => {
      expect(getByText("Interval 3")).toBeTruthy();
    });
  });
});
