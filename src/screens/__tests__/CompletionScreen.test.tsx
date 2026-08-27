import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CompletionScreen from "../CompletionScreen";
import { Timer } from "../../model/Timer";

describe("CompletionScreen", () => {
  const mockTimer: Timer = {
    id: "timer-123",
    name: "Full Body Blast",
    rounds: 2,
    intervals: [
      { id: "int-1", name: "Jumping Jacks", duration: 30, color: "#10B981" },
      { id: "int-2", name: "Rest", duration: 15, color: "#6B7280" },
    ],
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders workout summary stats and navigates back to timers", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Workout Complete! ⚡️")).toBeTruthy();
      expect(getByText("Back to Timers")).toBeTruthy();
    });

    const backButton = getByText("Back to Timers");
    fireEvent.press(backButton);

    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });

  it("navigates to Awards screen when Trophy Room button is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
    };

    const { getByText } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Trophy Room")).toBeTruthy();
    });

    const trophyButton = getByText("Trophy Room");
    fireEvent.press(trophyButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Awards");
  });

  it("handles sharing the completed workout", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getByText } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Share Workout")).toBeTruthy();
    });

    const shareButton = getByText("Share Workout");
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });
  });

  it("handles newly unlocked badge modal and sharing badge", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getByText, getAllByText, queryByText } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getAllByText("First Step Hero").length).toBeGreaterThan(0);
    });

    // Press badge card to open celebrate modal
    const badgeCard = getAllByText("First Step Hero")[0];
    fireEvent.press(badgeCard);

    await waitFor(() => {
      expect(getByText("Share Badge")).toBeTruthy();
    });

    // Share achievement from modal
    const shareAchievementBtn = getByText("Share Badge");
    fireEvent.press(shareAchievementBtn);

    // Dismiss badge modal
    const continueBtn = getByText("OK");
    fireEvent.press(continueBtn);

    expect(queryByText("Share Badge")).toBeNull();
  });
});
