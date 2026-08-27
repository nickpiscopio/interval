import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwardsScreen from "../AwardsScreen";
import { saveUserStats } from "../../services/badgeService";

describe("AwardsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders trophy room with user stats and badges", async () => {
    await saveUserStats({
      totalWorkouts: 3,
      totalSeconds: 3660,
      currentStreak: 2,
      longestStreak: 2,
      lastWorkoutDate: "2026-08-26",
      unlockedBadgeIds: ["first_step_hero"],
      totalShares: 1,
    });

    const mockNavigation: any = {
      goBack: jest.fn(),
    };

    const { getByText, getAllByText } = render(
      <AwardsScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getAllByText("Trophy Room").length).toBeGreaterThan(0);
      expect(getByText("First Step Hero")).toBeTruthy();
    });

    // Test back button
    const backButton = getByText("arrow-back");
    fireEvent.press(backButton);
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("opens badge details modal when badge item is pressed", async () => {
    await saveUserStats({
      totalWorkouts: 1,
      totalSeconds: 600,
      currentStreak: 1,
      longestStreak: 1,
      unlockedBadgeIds: ["first_step_hero"],
      totalShares: 0,
    });

    const { getByText, getAllByText } = render(
      <AwardsScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("First Step Hero")).toBeTruthy();
    });

    const badgeItem = getByText("First Step Hero");
    fireEvent.press(badgeItem);

    await waitFor(() => {
      expect(getByText("Share Achievement")).toBeTruthy();
    });

    // Share achievement
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const shareBtn = getByText("Share Achievement");
    fireEvent.press(shareBtn);

    // Close modal
    const closeBtn = getByText("close");
    fireEvent.press(closeBtn);
  });

  it("handles sharing app from invite banner", async () => {
    jest.spyOn(Share, "share").mockResolvedValueOnce({
      action: Share.sharedAction,
      activityType: "com.apple.UIKit.activity.PostToTwitter",
    });

    const { getByText } = render(
      <AwardsScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Workout With Friends 🚀")).toBeTruthy();
    });

    const inviteBanner = getByText("Workout With Friends 🚀");
    fireEvent.press(inviteBanner);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });
  });
});
