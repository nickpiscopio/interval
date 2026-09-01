import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SelectTimerScreen from "../SelectTimerScreen";
import { AlertProvider } from "../../context/AlertContext";
import { DEFAULT_AI_TIMERS } from "../../constants/defaultTimers";

function renderWithAlert(ui: React.ReactElement) {
  return render(<AlertProvider>{ui}</AlertProvider>);
}

describe("SelectTimerScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem("@hiit_has_agreed_legal_disclaimer", "true");
    jest.clearAllMocks();
  });

  it("seeds and displays default daily timers on initial launch", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });
  });

  it("navigates to CreateTimer when 'Create Custom' FAB is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByTestId("btn-create-custom")).toBeTruthy();
    }, { timeout: 3500 });

    const createBtn = getByTestId("btn-create-custom");
    fireEvent.press(createBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("CreateTimer");
  });

  it("navigates to GenerateTimer when 'Generate with AI' FAB is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByTestId("btn-generate-ai")).toBeTruthy();
    }, { timeout: 3500 });

    const generateBtn = getByTestId("btn-generate-ai");
    fireEvent.press(generateBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("GenerateTimer");
  });

  it("navigates to Timer workout runner when play button is pressed on a card", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getAllByText } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getAllByText("play").length).toBeGreaterThan(0);
    }, { timeout: 3500 });

    const playButtons = getAllByText("play");
    fireEvent.press(playButtons[0]);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "Timer",
      expect.objectContaining({
        timer: expect.any(Object),
      })
    );
  });

  it("navigates to Awards screen when trophy icon is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("trophy")).toBeTruthy();
    }, { timeout: 3500 });

    const trophyBtn = getByText("trophy");
    fireEvent.press(trophyBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Awards");
  });

  it("navigates to CreateTimer in edit mode when a timer card is tapped", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });

    const card = getByText(DEFAULT_AI_TIMERS[0].name);
    fireEvent.press(card);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "CreateTimer",
      expect.objectContaining({
        timer: expect.objectContaining({
          name: DEFAULT_AI_TIMERS[0].name,
        }),
      })
    );
  });

  it("loads existing customized timers from AsyncStorage and handles drag handle press", async () => {
    const existingTimers = [
      {
        id: "timer-custom-1",
        name: "Quick Tabata",
        rounds: 1,
        createdAt: 12345678,
        intervals: [
          { id: "i1", name: "Sprint", duration: 20, color: "#10B981" },
        ],
      },
    ];
    await AsyncStorage.setItem("@hiit_initialized", "true");
    await AsyncStorage.setItem("@hiit_timers", JSON.stringify(existingTimers));

    const { getByText, getByTestId, getAllByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Quick Tabata")).toBeTruthy();
      expect(getByText("20s")).toBeTruthy();
    }, { timeout: 3500 });

    // Long press to enter selection and enter reorder mode
    const card = getByTestId("timer-card-timer-custom-1");
    fireEvent(card, "longPress");

    const reorderBtn = getByTestId("btn-header-reorder");
    fireEvent.press(reorderBtn);

    const dragHandles = getAllByTestId("icon-drag-indicator");
    fireEvent(dragHandles[0], "pressIn");

    // Exit reorder mode and auto-clear selection mode
    fireEvent.press(getByTestId("btn-header-done-reorder"));

    // Test list scroll event
    const list = getByText("Quick Tabata");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { y: 150 },
        contentSize: { height: 1000, width: 375 },
        layoutMeasurement: { height: 600, width: 375 },
      },
    });
  });

  it("switches to Exercise Library tab and starts quick routine or custom timer", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByTestId, getByText, getAllByText } = renderWithAlert(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    // Switch to Exercise Library tab
    const libraryTab = getByTestId("tab-library");
    fireEvent.press(libraryTab);

    await waitFor(() => {
      expect(getByText("Exercise Library 📚")).toBeTruthy();
      expect(getByText("Tibialis Raises")).toBeTruthy();
    }, { timeout: 3500 });

    // Press an exercise card to open details
    const tibialisCard = getByText("Tibialis Raises");
    fireEvent.press(tibialisCard);

    // Start Quick Routine
    expect(getByText("Start Quick Routine")).toBeTruthy();
    const quickRoutineBtn = getByText("Start Quick Routine");
    fireEvent.press(quickRoutineBtn);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "Timer",
        expect.objectContaining({
          timer: expect.objectContaining({
            name: "Tibialis Raises",
            rounds: 3,
          }),
        })
      );
    }, { timeout: 3500 });

    // Open another exercise and Create Custom Timer
    fireEvent.press(tibialisCard);
    const createCustomBtn = getByText("Create Custom Workout");
    fireEvent.press(createCustomBtn);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "CreateTimer",
        expect.objectContaining({
          timer: expect.objectContaining({
            name: "Tibialis Raises Routine",
          }),
        })
      );
    }, { timeout: 3500 });

    // Switch back to Workouts tab
    const workoutsTab = getByTestId("tab-workouts");
    fireEvent.press(workoutsTab);

    expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
  });

  it("displays legal agreement gate on first launch and saves acceptance with date", async () => {
    await AsyncStorage.removeItem("@legal_disclaimer_accepted");
    await AsyncStorage.removeItem("@legal_disclaimer_accepted_date");

    const { getByTestId, getByText, queryByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("IMPORTANT SAFETY & HEALTH NOTICE")).toBeTruthy();
      expect(getByText("Legal Agreement & Medical Disclaimer")).toBeTruthy();
    }, { timeout: 3500 });

    const agreeBtn = getByTestId("legal-agree-button");
    fireEvent.press(agreeBtn);

    await waitFor(async () => {
      const accepted = await AsyncStorage.getItem("@legal_disclaimer_accepted");
      const acceptedDate = await AsyncStorage.getItem("@legal_disclaimer_accepted_date");
      expect(accepted).toBe("true");
      expect(acceptedDate).toBeTruthy();
    }, { timeout: 3500 });
  });

  it("opens legal agreement in review mode from header info button with agreed date", async () => {
    await AsyncStorage.setItem("@legal_disclaimer_accepted", "true");
    await AsyncStorage.setItem("@legal_disclaimer_accepted_date", "Aug 27, 2026");

    const { getByTestId, getByText } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByTestId("legal-info-header-btn")).toBeTruthy();
    }, { timeout: 3500 });

    const infoBtn = getByTestId("legal-info-header-btn");
    fireEvent.press(infoBtn);

    expect(getByText("Legal Agreement & Medical Disclaimer")).toBeTruthy();
    expect(getByText("Agreed on Aug 27, 2026")).toBeTruthy();
    expect(getByTestId("legal-modal-close-btn")).toBeTruthy();

    const closeBtn = getByTestId("legal-modal-close-btn");
    fireEvent.press(closeBtn);
  });

  it("enters selection mode on card long press and reveals contextual header actions", async () => {
    const { getByTestId, getByText, queryByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });

    const firstCard = getByTestId(`timer-card-${DEFAULT_AI_TIMERS[0].id}`);
    fireEvent(firstCard, "longPress");

    expect(getByText("1 Selected")).toBeTruthy();
    expect(getByTestId("btn-close-selection")).toBeTruthy();
    expect(getByTestId("btn-header-share")).toBeTruthy();
    expect(getByTestId("btn-header-reorder")).toBeTruthy();
    expect(getByTestId("btn-header-delete")).toBeTruthy();

    // Dismiss selection mode
    fireEvent.press(getByTestId("btn-close-selection"));
    expect(queryByTestId("btn-close-selection")).toBeNull();
    expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
  });

  it("toggles reorder mode and exits via Done button", async () => {
    const { getByTestId, getByText, queryByTestId } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });

    const firstCard = getByTestId(`timer-card-${DEFAULT_AI_TIMERS[0].id}`);
    fireEvent(firstCard, "longPress");

    const reorderBtn = getByTestId("btn-header-reorder");
    fireEvent.press(reorderBtn);

    expect(getByText("Rearrange Timers")).toBeTruthy();
    expect(getByTestId("btn-header-done-reorder")).toBeTruthy();

    fireEvent.press(getByTestId("btn-header-done-reorder"));
    expect(queryByTestId("btn-header-done-reorder")).toBeNull();
  });

  it("shares selected timer from contextual header", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getByTestId, getByText } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });

    const firstCard = getByTestId(`timer-card-${DEFAULT_AI_TIMERS[0].id}`);
    fireEvent(firstCard, "longPress");

    const headerShareBtn = getByTestId("btn-header-share");
    fireEvent.press(headerShareBtn);

    expect(shareSpy).toHaveBeenCalled();
  });

  it("deletes selected timer via header delete action", async () => {
    const { getByTestId, getByText, queryByText } = renderWithAlert(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    }, { timeout: 3500 });

    const firstTimerName = DEFAULT_AI_TIMERS[0].name;
    const firstCard = getByTestId(`timer-card-${DEFAULT_AI_TIMERS[0].id}`);
    fireEvent(firstCard, "longPress");

    const headerDeleteBtn = getByTestId("btn-header-delete");
    fireEvent.press(headerDeleteBtn);

    // CustomAlertModal confirm delete button
    await waitFor(() => {
      expect(getByText("Delete Timers")).toBeTruthy();
      expect(getByText("Delete")).toBeTruthy();
    });

    fireEvent.press(getByText("Delete"));

    await waitFor(() => {
      expect(queryByText(firstTimerName)).toBeNull();
    });
  });
});


