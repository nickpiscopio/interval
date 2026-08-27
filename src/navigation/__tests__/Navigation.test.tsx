import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Navigation from "../index";
import { AlertProvider } from "../../context/AlertContext";

describe("Navigation Root Stack", () => {
  it("renders NavigationContainer and RootNavigator successfully", async () => {
    const { getByText } = render(
      <AlertProvider>
        <Navigation />
      </AlertProvider>
    );

    await waitFor(() => {
      expect(getByText("Let's Workout! ⚡️")).toBeTruthy();
    });
  });
});
