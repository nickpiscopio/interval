import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "../index";
import { AlertProvider } from "../../context/AlertContext";

describe("Navigation Root Stack", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("renders NavigationContainer and RootNavigator successfully", async () => {
    const { getByText } = render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <Navigation />
        </AlertProvider>
      </GestureHandlerRootView>
    );

    await waitFor(() => {
      expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
    }, { timeout: 3500 });
  });
});
