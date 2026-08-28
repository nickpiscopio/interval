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

    const saveBtn = getByTestId("icon-bookmark-outline");
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

    const saveBtn = getByTestId("icon-bookmark-outline");
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

  it("selects intervals from list and navigates between carousel cards", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getAllByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // Select Low Interval from list
    const lowIntervalItem = getAllByText("Low Interval")[0];
    fireEvent.press(lowIntervalItem);

    // Navigate to previous card using footer link
    const detailsLinks = getAllByText("Timer Details");
    const detailsFooterLink = detailsLinks[detailsLinks.length - 1];
    fireEvent.press(detailsFooterLink);

    // Navigate back to Edit Interval using right footer link
    const editIntervalLinks = getAllByText("Edit Interval");
    fireEvent.press(editIntervalLinks[editIntervalLinks.length - 1]);
  });

  it("duplicates interval, deletes interval, and warns when trying to delete last interval", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByTestId, getAllByTestId, queryByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // Add new interval
    const addIntervalBtn = getByText("Add Interval");
    fireEvent.press(addIntervalBtn);

    // Duplicate interval
    const duplicateBtn = getByTestId("icon-copy-outline");
    fireEvent.press(duplicateBtn);

    expect(getByText("Add Interval (Copy)")).toBeTruthy();

    // Delete duplicated interval
    const trashBtn = getByTestId("icon-trash-outline");
    fireEvent.press(trashBtn);
    expect(queryByText("Add Interval (Copy)")).toBeNull();

    // Delete intervals until only 1 remains
    fireEvent.press(trashBtn);
    fireEvent.press(trashBtn);

    // Try to delete the very last remaining interval -> triggers alert
    fireEvent.press(trashBtn);
    expect(getByText("Please add at least one interval.")).toBeTruthy();

    const dragHandles = getAllByTestId("icon-drag-indicator");
    if (dragHandles.length > 0) {
      fireEvent(dragHandles[0], "pressIn");
    }
  });

  it("opens exercise library picker modal and selects exercise", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText, getByPlaceholderText, getByDisplayValue, getByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    const libraryBtn = getByText("Library");
    fireEvent.press(libraryBtn);

    expect(getByText("Tibialis Raises")).toBeTruthy();
    const item = getByText("Tibialis Raises");
    fireEvent.press(item);

    expect(getByText("Add to Timer")).toBeTruthy();
    const addBtn = getByText("Add to Timer");
    fireEvent.press(addBtn);

    expect(getByText("Tibialis Raises")).toBeTruthy();

    // Change interval name manually
    const intervalNameInput = getByPlaceholderText("Interval name");
    fireEvent.changeText(intervalNameInput, "Burpees Warmup");
    expect(getByText("Burpees Warmup")).toBeTruthy();

    // Change duration
    const durationInput = getByDisplayValue("00:00:30");
    fireEvent.changeText(durationInput, "000045");
    fireEvent(durationInput, "blur");

    // Select color
    const checkmark = getByTestId("icon-checkmark");
    fireEvent.press(checkmark);
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

    const { getByDisplayValue, getByText, getAllByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: mockTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByDisplayValue("Existing Workout")).toBeTruthy();

    // Delete existing timer via trash icon in timer actions
    const trashIcons = getAllByTestId("icon-trash-outline");
    fireEvent.press(trashIcons[0]);

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

    const { getByText, getByDisplayValue, getAllByTestId } = render(
      <AlertProvider>
        <CreateTimerScreen
          navigation={mockNavigation}
          route={{ params: { timer: importedTimer } } as any}
        />
      </AlertProvider>
    );

    expect(getByDisplayValue("Shared AI HIIT")).toBeTruthy();
    expect(getByText("Review & Import Shared Timer")).toBeTruthy();

    const saveBtns = getAllByTestId("icon-download-outline");
    fireEvent.press(saveBtns[1]);

    await waitFor(() => {
      expect(mockNavigation.popToTop).toHaveBeenCalled();
    });
  });

  it("handles right-to-left 6-digit shift register for duration input, backspace, and blur normalization", () => {
    const mockNavigation: any = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByDisplayValue, getByText, getAllByText } = render(
      <AlertProvider>
        <CreateTimerScreen navigation={mockNavigation} route={{} as any} />
      </AlertProvider>
    );

    // Initial selected interval is High Interval (30s) -> "00:00:30"
    const durationInput = getByDisplayValue("00:00:30");

    // Type 4 -> "00:00:04"
    fireEvent.changeText(durationInput, "4");
    expect(getByDisplayValue("00:00:04")).toBeTruthy();

    // Type 5 after 00:00:04 -> "0000045" -> "00:00:45"
    fireEvent.changeText(durationInput, "00:00:045");
    expect(getByDisplayValue("00:00:45")).toBeTruthy();

    // Type 0 -> "0000450" -> "00:04:50"
    fireEvent.changeText(durationInput, "00:00:450");
    expect(getByDisplayValue("00:04:50")).toBeTruthy();

    // Backspace: simulate removing last digit from 00:04:50 -> "00:04:5"
    fireEvent.changeText(durationInput, "00:04:5");
    expect(getByDisplayValue("00:00:45")).toBeTruthy();

    // Type empty or 0 -> "00:00:00"
    fireEvent.changeText(durationInput, "");
    expect(getByDisplayValue("00:00:00")).toBeTruthy();

    // Blur -> defaults minimum to 1s -> "00:00:01"
    fireEvent(durationInput, "blur");
    expect(getByDisplayValue("00:00:01")).toBeTruthy();

    // Switch to Low Interval (15s)
    const lowInterval = getByText("Low Interval");
    fireEvent.press(lowInterval);
    expect(getByDisplayValue("00:00:15")).toBeTruthy();

    // Type 055832 -> "05:58:32" -> converts to 5h 58m 32s on interval card
    const lowDurationInput = getByDisplayValue("00:00:15");
    fireEvent.changeText(lowDurationInput, "055832");
    expect(getByDisplayValue("05:58:32")).toBeTruthy();
    expect(getByText("5h 58m 32s")).toBeTruthy();

    // When on Card 2 (Edit Interval), bottom navigation displays "Timer Details"
    expect(getAllByText("Timer Details").length).toBeGreaterThanOrEqual(1);
  });
});
