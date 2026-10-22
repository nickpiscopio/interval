import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent, act } from "@testing-library/react-native";
import GenerateTimerScreen from "../GenerateTimerScreen";
import Spacing from "../../constants/Spacing";

describe("GenerateTimerScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders rebranded 'Workout Generator' title, description without AI, and 16px screen padding", () => {
    const { getByText, getByTestId, queryByText } = render(
      <GenerateTimerScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText("Workout Generator")).toBeTruthy();
    expect(queryByText("AI Workout Generator")).toBeNull();

    const desc = getByText(/Tell us a little about what you are looking for/);
    expect(desc).toBeTruthy();
    expect(desc.props.children).not.toContain("AI");

    const scroll = getByTestId("generate-timer-scroll");
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);
    expect(contentStyle.padding).toBe(Spacing.md);
  });

  it("renders fitness survey questions and options", () => {
    const { getByText } = render(
      <GenerateTimerScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText("What is your fitness goal?")).toBeTruthy();
    expect(getByText("Lose weight")).toBeTruthy();
    expect(getByText("Get toned")).toBeTruthy();
    expect(getByText("Bulk up")).toBeTruthy();
    expect(getByText("Generate Timer")).toBeTruthy();
  });

  it("selects options and triggers workout generation", () => {
    const mockNavigation: any = {
      navigate: jest.fn(),
    };

    const { getByText } = render(
      <GenerateTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    const tonedOption = getByText("Get toned");
    fireEvent.press(tonedOption);

    const bulkOption = getByText("Bulk up");
    fireEvent.press(bulkOption);

    const weightLossOption = getByText("Lose weight");
    fireEvent.press(weightLossOption);

    const absOption = getByText("Abs");
    fireEvent.press(absOption);

    const upperOption = getByText("Upper body");
    fireEvent.press(upperOption);

    const lowerOption = getByText("Lower body");
    fireEvent.press(lowerOption);

    const cardioOption = getByText("Cardio");
    fireEvent.press(cardioOption);

    const totalOption = getByText("Total body");
    fireEvent.press(totalOption);

    const surpriseOption = getByText("Surprise me!");
    fireEvent.press(surpriseOption);

    const intermediateOption = getByText("Intermediate");
    fireEvent.press(intermediateOption);

    const advancedOption = getByText("Advanced");
    fireEvent.press(advancedOption);

    const beginnerOption = getByText("Beginner");
    fireEvent.press(beginnerOption);

    const generateBtn = getByText("Generate Timer");
    fireEvent.press(generateBtn);

    // Fast-forward timers for loading simulation
    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "CreateTimer",
      expect.objectContaining({
        timer: expect.objectContaining({
          isAiGenerated: true,
        }),
      })
    );
  });

  it("navigates back when header back button is pressed", () => {
    const mockNavigation: any = {
      goBack: jest.fn(),
    };

    const { getByTestId } = render(
      <GenerateTimerScreen navigation={mockNavigation} route={{} as any} />
    );

    const backBtn = getByTestId("header-back-button");
    const style = StyleSheet.flatten(backBtn.props.style);
    expect(style.marginLeft).toBe(-10);
    fireEvent.press(backBtn);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
