import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "../Input";
import { IntervalInput } from "../IntervalInput";

describe("Input Components", () => {
  it("renders Input with title and prefix", () => {
    const { getByText } = render(
      <Input title="Interval Name" prefix="Workout:" leftAlignText={true} />
    );
    expect(getByText("Interval Name")).toBeTruthy();
    expect(getByText("Workout:")).toBeTruthy();
  });

  it("handles press to focus in Input component", () => {
    const { getByText } = render(
      <Input title="Test Title" leftAlignText={false} />
    );
    const pressable = getByText("Test Title");
    fireEvent.press(pressable);
  });

  it("renders IntervalInput and handles text changes", () => {
    const { getByDisplayValue } = render(
      <IntervalInput defaultText="Jumping Jacks" />
    );

    const nameInput = getByDisplayValue("Jumping Jacks");
    fireEvent.changeText(nameInput, "High Knees");
    expect(getByDisplayValue("High Knees")).toBeTruthy();

    const timeInput = getByDisplayValue("00m 00s");
    fireEvent.changeText(timeInput, "00m 30s");
    expect(getByDisplayValue("00m 30s")).toBeTruthy();
  });
});
