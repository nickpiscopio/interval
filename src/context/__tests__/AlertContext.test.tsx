import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TouchableOpacity, Text } from "react-native";
import { AlertProvider, useAlert } from "../AlertContext";

function TestConsumer() {
  const { showAlert, hideAlert } = useAlert();
  return (
    <TouchableOpacity
      onPress={() =>
        showAlert({
          title: "Test Alert",
          message: "Alert Body",
          buttons: [{ text: "Dismiss", onPress: hideAlert }],
        })
      }
    >
      <Text>Trigger Alert</Text>
    </TouchableOpacity>
  );
}

describe("AlertContext", () => {
  it("throws error when useAlert is used outside AlertProvider", () => {
    // Suppress console.error for expected React error boundary
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAlert must be used within an AlertProvider"
    );
    spy.mockRestore();
  });

  it("provides showAlert and hideAlert within AlertProvider", () => {
    const { getByText } = render(
      <AlertProvider>
        <TestConsumer />
      </AlertProvider>
    );

    const triggerBtn = getByText("Trigger Alert");
    fireEvent.press(triggerBtn);

    expect(getByText("Test Alert")).toBeTruthy();
    expect(getByText("Alert Body")).toBeTruthy();

    const dismissBtn = getByText("Dismiss");
    fireEvent.press(dismissBtn);
  });
});
