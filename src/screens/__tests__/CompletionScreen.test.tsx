import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share, StyleSheet, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import CompletionScreen from "../CompletionScreen";
import { Timer } from "../../model/Timer";
import { saveUserStats, DEFAULT_USER_STATS } from "../../services/badgeService";
import { BADGE_CATALOG } from "../../constants/badges";
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

  it("plays triple beep on mount with mixWithOthers and unloads player on unmount", async () => {
    const { unmount, getByText } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Workout Complete! ⚡️")).toBeTruthy();
    });

    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
    });
    expect(createAudioPlayer).toHaveBeenCalled();
    const playerInstance = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(playerInstance.play).toHaveBeenCalled();

    unmount();
    expect(playerInstance.release).toHaveBeenCalled();
  });

  it("renders workout summary stats and navigates back to timers via top-right close X button", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
      replace: jest.fn(),
    };

    const { getByText, getByTestId, queryByText } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Workout Complete! ⚡️")).toBeTruthy();
    });

    // Old "Back to Timers" text button is replaced by top-right close X button
    expect(queryByText("Back to Timers")).toBeNull();
    const closeBtn = getByTestId("btn-close-completion");
    fireEvent.press(closeBtn);

    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });

  it("restarts the same timer when left Restart icon button in bottom blue card is pressed", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
      replace: jest.fn(),
    };

    const { getByTestId } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByTestId("btn-restart-workout")).toBeTruthy();
    });

    fireEvent.press(getByTestId("btn-restart-workout"));
    expect(mockNavigation.replace).toHaveBeenCalledWith("Timer", { timer: mockTimer });
  });

  it("renders OS-specific share icon in bottom blue action bar and shares workout", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const originalOS = Platform.OS;
    Platform.OS = "ios";

    const { getByTestId, unmount } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByTestId("icon-share-outline")).toBeTruthy();
    });

    fireEvent.press(getByTestId("btn-share-workout"));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });

    unmount();

    Platform.OS = "android";
    const { getByTestId: getByTestIdAndroid } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByTestIdAndroid("icon-share-social-outline")).toBeTruthy();
    });

    Platform.OS = originalOS;
  });

  it("opens store URL when right Rate the App icon button in bottom blue card is pressed", async () => {
    const openUrlSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true as any);
    const originalOS = Platform.OS;
    Platform.OS = "ios";

    const { getByTestId } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByTestId("btn-rate-app")).toBeTruthy();
    });

    fireEvent.press(getByTestId("btn-rate-app"));
    expect(openUrlSpy).toHaveBeenCalledWith(
      "https://apps.apple.com/app/interval-hiit-timer/id12345678"
    );

    Platform.OS = originalOS;
    openUrlSpy.mockRestore();
  });

  it("renders circular amber Trophy button in unlocked header row when achievements are unlocked and pluralizes header for multiple achievements", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
    };

    // First workout unlocks both first_step_hero and custom_creator (2 achievements)
    const { getByText, getByTestId, queryByTestId } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("New Achievements Unlocked")).toBeTruthy();
    });

    expect(getByTestId("unlocked-section-header")).toBeTruthy();
    expect(queryByTestId("centered-trophy-row")).toBeNull();

    const trophyButton = getByTestId("btn-completion-achievements");
    fireEvent.press(trophyButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Awards");
  });

  it("renders singular 'New Achievement Unlocked' when exactly 1 achievement is unlocked", async () => {
    // Pre-unlock custom_creator so only first_step_hero unlocks (1 achievement)
    const today = new Date().toISOString().split("T")[0];
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      lastWorkoutDate: today,
      currentStreak: 1,
      longestStreak: 1,
      unlockedBadgeIds: ["custom_creator", "early_bird", "night_owl"],
    });

    const { getByText, queryByText } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("New Achievement Unlocked")).toBeTruthy();
    });
    expect(queryByText("New Achievements Unlocked")).toBeNull();
  });

  it("renders circular amber Trophy button centered below stats card when no new achievements are unlocked", async () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
      popToTop: jest.fn(),
    };

    // Pre-unlock all badges so 0 new achievements unlock
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 5,
      currentStreak: 1,
      longestStreak: 1,
      unlockedBadgeIds: BADGE_CATALOG.map((b) => b.id),
    });

    const { getByTestId, queryByTestId, getByText } = render(
      <CompletionScreen
        navigation={mockNavigation}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText("Workout Complete! ⚡️")).toBeTruthy();
      expect(getByTestId("centered-trophy-row")).toBeTruthy();
    });

    expect(queryByTestId("unlocked-section-header")).toBeNull();

    const trophyButton = getByTestId("btn-completion-achievements");
    fireEvent.press(trophyButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Awards");
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

  it("pins header and footer while scrolling only the unlocked achievement cards list", async () => {
    const { getByTestId } = render(
      <CompletionScreen
        navigation={{} as any}
        route={{ params: { timer: mockTimer } } as any}
      />
    );

    await waitFor(() => {
      expect(getByTestId("unlocked-badges-scroll")).toBeTruthy();
    });

    const scrollView = getByTestId("unlocked-badges-scroll");
    const scrollStyle = StyleSheet.flatten(scrollView.props.style);
    expect(scrollStyle.flex).toBe(1);

    const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);
    expect(contentStyle.paddingBottom).toBeGreaterThanOrEqual(100);
  });
});
