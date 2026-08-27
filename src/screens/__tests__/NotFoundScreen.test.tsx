import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NotFoundScreen from "../NotFoundScreen";

describe("NotFoundScreen", () => {
  it("renders 404 text and navigates to home on tap", () => {
    const mockNavigation: any = {
      replace: jest.fn(),
    };

    const { getByText } = render(
      <NotFoundScreen navigation={mockNavigation} route={{} as any} />
    );

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
    const link = getByText("Go to home screen!");
    fireEvent.press(link);

    expect(mockNavigation.replace).toHaveBeenCalledWith("Root");
  });
});
