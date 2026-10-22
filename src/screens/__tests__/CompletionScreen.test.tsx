import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer } from "expo-audio";
import CompletionScreen from "../CompletionScreen";
import { Timer } from "../../model/Timer";
import Colors from "../../constants/Colors";

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

  it("plays triple beep on mount and unloads player on unmount", () => {
    const { unmount } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    expect(createAudioPlayer).toHaveBeenCalled();
    const playerInstance = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(playerInstance.play).toHaveBeenCalled();

    unmount();
    expect(playerInstance.release).toHaveBeenCalled();
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

  it("navigates to Awards screen when Achievements button is pressed", async () => {
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
      expect(getByText("Achievements")).toBeTruthy();
    });

    const trophyButton = getByText("Achievements");
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

  it("handles newly unlocked badge modal, dismisses on backdrop tap, and checks overlay style", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getByText, getAllByText, getByTestId, queryByText } = render(
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

    // Overlay backdrop has unified opacity
    const overlay = getByTestId("modal-overlay");
    const overlayStyle = StyleSheet.flatten(overlay.props.style);
    expect(overlayStyle.backgroundColor).toBe(Colors.surface.overlay);

    // Share achievement from modal
    const shareAchievementBtn = getByText("Share Badge");
    fireEvent.press(shareAchievementBtn);

    // Tap outside on modal-overlay to dismiss
    fireEvent.press(overlay);

    await waitFor(() => {
      expect(queryByText("Share Badge")).toBeNull();
    });
  });
});
