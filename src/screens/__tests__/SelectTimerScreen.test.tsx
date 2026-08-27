import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SelectTimerScreen from "../SelectTimerScreen";
import { DEFAULT_AI_TIMERS } from "../../constants/defaultTimers";

describe("SelectTimerScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("seeds and displays default daily timers on initial launch", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    });
  });

  it("navigates to CreateTimer when 'Create Custom' button is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Create Custom")).toBeTruthy();
    });

    const createBtn = getByText("Create Custom");
    fireEvent.press(createBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("CreateTimer");
  });

  it("navigates to GenerateTimer when 'Generate with AI' button is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Generate with AI")).toBeTruthy();
    });

    const generateBtn = getByText("Generate with AI");
    fireEvent.press(generateBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("GenerateTimer");
  });

  it("navigates to Timer workout runner when play button is pressed on a card", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getAllByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getAllByText("play").length).toBeGreaterThan(0);
    });

    const playButtons = getAllByText("play");
    fireEvent.press(playButtons[0]);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "Timer",
      expect.objectContaining({
        timer: expect.any(Object),
      })
    );
  });

  it("shares timer via deep link share button", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getAllByText } = render(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getAllByText("share-outline").length).toBeGreaterThan(0);
    });

    const shareButtons = getAllByText("share-outline");
    fireEvent.press(shareButtons[0]);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });
  });

  it("navigates to Awards screen when trophy icon is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("trophy")).toBeTruthy();
    });

    const trophyBtn = getByText("trophy");
    fireEvent.press(trophyBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Awards");
  });

  it("navigates to CreateTimer in edit mode when a timer card is tapped", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText(DEFAULT_AI_TIMERS[0].name)).toBeTruthy();
    });

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

    const { getByText, getAllByTestId } = render(
      <SelectTimerScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Quick Tabata")).toBeTruthy();
      expect(getByText("20s")).toBeTruthy();
    });

    const dragHandles = getAllByTestId("icon-drag-indicator");
    fireEvent(dragHandles[0], "pressIn");

    // Test list scroll event
    const list = getByText("Quick Tabata");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { y: 150 },
        contentSize: { height: 1000, width: 375 },
        layoutMeasurement: { height: 600, width: 375 },
      },
    });

    // Test card share button
    const shareIcons = getAllByTestId("icon-share-outline");
    fireEvent.press(shareIcons[0]);
  });

  it("switches to Exercise Library tab and starts quick routine or custom timer", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByTestId, getByText, getAllByText } = render(
      <SelectTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    // Switch to Exercise Library tab
    const libraryTab = getByTestId("tab-library");
    fireEvent.press(libraryTab);

    await waitFor(() => {
      expect(getByText("Exercise Library 📚")).toBeTruthy();
      expect(getByText("Tibialis Raises")).toBeTruthy();
    });

    // Press an exercise card to open details
    const tibialisCard = getByText("Tibialis Raises");
    fireEvent.press(tibialisCard);

    // Start Quick Routine
    expect(getByText("Start Quick Routine")).toBeTruthy();
    const quickRoutineBtn = getByText("Start Quick Routine");
    fireEvent.press(quickRoutineBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "Timer",
      expect.objectContaining({
        timer: expect.objectContaining({
          name: "Tibialis Raises",
          rounds: 3,
        }),
      })
    );

    // Open another exercise and Create Custom Timer
    fireEvent.press(tibialisCard);
    const createCustomBtn = getByText("Create Custom Workout");
    fireEvent.press(createCustomBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "CreateTimer",
      expect.objectContaining({
        timer: expect.objectContaining({
          name: "Tibialis Raises Routine",
          rounds: 3,
        }),
      })
    );

    // Switch back to Workouts tab
    const workoutsTab = getByTestId("tab-workouts");
    fireEvent.press(workoutsTab);

    expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
  });
});
