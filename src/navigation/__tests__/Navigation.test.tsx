import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { logEvent as firebaseLogEvent } from "@react-native-firebase/analytics";
import {
  recordError as firebaseRecordError,
  setAttribute as firebaseSetAttribute,
} from "@react-native-firebase/crashlytics";
import Navigation from "../index";
import LinkingConfiguration from "../LinkingConfiguration";
import { AlertProvider } from "../../context/AlertContext";
import { encodeBase64 } from "../../utils/base64";

describe("Navigation Root Stack", () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem("@legal_disclaimer_accepted", "true");
    jest.clearAllMocks();
    (global as any).__DEV__ = false;
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  it("renders NavigationContainer, logs initial screen view, and tracks navigation transitions", async () => {
    const { getByText, getByTestId } = render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <Navigation />
        </AlertProvider>
      </GestureHandlerRootView>
    );

    await waitFor(() => {
      expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
    }, { timeout: 3500 });

    expect(firebaseLogEvent).toHaveBeenCalledWith(
      expect.anything(),
      "screen_view",
      { screen_name: "Workouts", screen_class: "Workouts" }
    );
    expect(firebaseSetAttribute).toHaveBeenCalledWith(
      expect.anything(),
      "current_screen",
      "Workouts"
    );

    // Switch tab to ExerciseLibrary
    fireEvent.press(getByTestId("tab-library"));
    expect(firebaseLogEvent).toHaveBeenCalledWith(
      expect.anything(),
      "screen_view",
      { screen_name: "ExerciseLibrary", screen_class: "ExerciseLibrary" }
    );
    expect(firebaseSetAttribute).toHaveBeenCalledWith(
      expect.anything(),
      "current_screen",
      "ExerciseLibrary"
    );

    // Navigate to Awards screen
    fireEvent.press(getByTestId("btn-achievements"));
    await waitFor(() => {
      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "screen_view",
        { screen_name: "Awards", screen_class: "Awards" }
      );
      expect(firebaseSetAttribute).toHaveBeenCalledWith(
        expect.anything(),
        "current_screen",
        "Awards"
      );
    });
  });

  it("emits timer_imported when decoding a valid shared timer link and records non-fatal on malformed payload", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const parseTimer = (LinkingConfiguration.config as any).screens.CreateTimer.parse.timer;

    const encoded = encodeBase64(
      JSON.stringify({
        name: "Private Custom Name",
        rounds: 3,
        intervals: [
          { id: "1", name: "Work", duration: 30, color: "#10B981" },
          { id: "2", name: "Rest", duration: 15, color: "#3B82F6" },
        ],
      })
    );

    const parsed = parseTimer(encoded);
    expect(parsed).toBeDefined();
    expect(firebaseLogEvent).toHaveBeenCalledWith(
      expect.anything(),
      "timer_imported",
      {
        interval_count: 2,
        rounds: 3,
        total_seconds: 135,
      }
    );

    const malformed = parseTimer("not-valid-json-base64!!!");
    expect(malformed).toBeUndefined();
    expect(firebaseRecordError).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Error),
      "deepLink.parseSharedTimer"
    );

    warnSpy.mockRestore();
  });
});
