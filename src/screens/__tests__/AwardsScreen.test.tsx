import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Share, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwardsScreen from "../AwardsScreen";
import { saveUserStats, saveBadgeTimestamps, DEFAULT_USER_STATS } from "../../services/badgeService";

describe("AwardsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders achievements with Unlocked section above Locked section, sorted newest-first, showing formatted unlock date instead of Done and omitting Locked label on locked cards", async () => {
    const aug25 = new Date(2026, 7, 25, 12, 0, 0).getTime(); // Aug 25, 2026
    const nov2 = new Date(2026, 10, 2, 12, 0, 0).getTime(); // Nov 2, 2026

    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 3,
      totalSeconds: 3660,
      currentStreak: 2,
      longestStreak: 2,
      lastWorkoutDate: "2026-11-02",
      unlockedBadgeIds: ["first_step_hero", "back_to_back_beast"],
      totalShares: 1,
    });
    await saveBadgeTimestamps({
      first_step_hero: aug25,
      back_to_back_beast: nov2,
    });

    const mockNavigation: any = {
      goBack: jest.fn(),
    };

    const { getByText, getAllByText, getByTestId, queryByText, toJSON } = render(
      <AwardsScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getAllByText("Achievements").length).toBeGreaterThan(0);
      expect(getByTestId("unlocked-badges-section")).toBeTruthy();
      expect(getByTestId("locked-badges-section")).toBeTruthy();
      expect(getByText("Unlocked")).toBeTruthy();
      expect(getByText("Locked")).toBeTruthy();
    });

    // Unlocked cards display formatted date instead of "Done"
    expect(getByText("Nov 2, 2026")).toBeTruthy();
    expect(getByText("Aug 25, 2026")).toBeTruthy();
    expect(queryByText("Done")).toBeNull();

    // Locked cards do NOT display redundant "Locked" text inside the cards
    // (Only the single "Locked" section header should appear)
    expect(getAllByText("Locked")).toHaveLength(1);

    // Newest unlocked badge (Back-to-Back Beast, Nov 2) appears before older unlocked badge (First Step Hero, Aug 25)
    // and Unlocked section appears before Locked section
    const treeJson = JSON.stringify(toJSON());
    expect(treeJson.indexOf("Back-to-Back Beast")).toBeLessThan(
      treeJson.indexOf("First Step Hero")
    );
    expect(treeJson.indexOf("unlocked-badges-section")).toBeLessThan(
      treeJson.indexOf("locked-badges-section")
    );

    // Test back button
    const backButton = getByTestId("header-back-button");
    const style = StyleSheet.flatten(backButton.props.style);
    expect(style.marginLeft).toBe(-10);
    fireEvent.press(backButton);
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("hides the Unlocked section when zero achievements are unlocked", async () => {
    const { getByTestId, queryByTestId, queryByText, getByText } = render(
      <AwardsScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByTestId("locked-badges-section")).toBeTruthy();
      expect(getByText("Locked")).toBeTruthy();
    });

    expect(queryByTestId("unlocked-badges-section")).toBeNull();
    expect(queryByText("Unlocked")).toBeNull();
  });

  it("opens badge details modal when badge item is pressed", async () => {
    await saveUserStats({
      ...DEFAULT_USER_STATS,
      totalWorkouts: 1,
      totalSeconds: 600,
      currentStreak: 1,
      longestStreak: 1,
      unlockedBadgeIds: ["first_step_hero"],
      totalShares: 0,
    });

    const { getByText } = render(
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

  it("dismisses badge modal when tapping outside on modal-overlay and omits How to Unlock tag for locked badges", async () => {
    const { getByText, getAllByText, getByTestId, queryByText } = render(
      <AwardsScreen navigation={{} as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText("Rehab Rookie")).toBeTruthy();
    });

    // Rehab Rookie is locked by default
    fireEvent.press(getByText("Rehab Rookie"));

    await waitFor(() => {
      expect(getAllByText("Rehab Rookie").length).toBe(2);
    });

    // "How to Unlock" tag should NOT be displayed
    expect(queryByText("How to Unlock")).toBeNull();

    // Tap outside overlay to dismiss
    const overlay = getByTestId("modal-overlay");
    fireEvent.press(overlay);

    await waitFor(() => {
      expect(getAllByText("Rehab Rookie").length).toBe(1);
    });
  });
});
