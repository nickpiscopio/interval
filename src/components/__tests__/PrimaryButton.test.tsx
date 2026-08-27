import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "../PrimaryButton";

describe("PrimaryButton Component", () => {
  it("renders with title and handles onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Start Workout" onPress={onPress} />
    );

    expect(getByText("Start Workout")).toBeTruthy();
    const button = getByText("Start Workout");
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
