import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ExercisePickerView } from "../ExercisePickerView";
import Spacing from "../../constants/Spacing";

describe("ExercisePickerView", () => {
  it("renders search bar, category chips, and catalog list", () => {
    const { getByPlaceholderText, getByText } = render(
      <ExercisePickerView onSelect={jest.fn()} />
    );

    expect(getByPlaceholderText("Search exercises...")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
    expect(getByText("Tibialis Raises")).toBeTruthy();
  });

  it("calls onBack when back button in header is pressed and has transparent style", () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <ExercisePickerView onBack={onBack} onSelect={jest.fn()} />
    );

    const backBtn = getByTestId("exercise-picker-back-btn");
    const style = StyleSheet.flatten(backBtn.props.style);
    expect(style.backgroundColor).toBe("transparent");
    expect(style.borderRadius).toBeUndefined();
    expect(style.marginLeft).toBe(-10);

    fireEvent.press(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("omits the close button when onClose is not provided", () => {
    const { queryByTestId } = render(
      <ExercisePickerView onBack={jest.fn()} onSelect={jest.fn()} />
    );

    expect(queryByTestId("exercise-picker-close-btn")).toBeNull();
  });

  it("calls onClose when close button in header is pressed when onClose is provided", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ExercisePickerView onClose={onClose} onSelect={jest.fn()} />
    );

    const closeBtn = getByTestId("exercise-picker-close-btn");
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates into exercise detail with transparent back button returning to catalog", () => {
    const { getByText, getByTestId, queryByTestId, getByPlaceholderText } = render(
      <ExercisePickerView onBack={jest.fn()} onSelect={jest.fn()} />
    );

    // Tap on an exercise card to inspect it
    fireEvent.press(getByText("Tibialis Raises"));

    // Verify detail view is rendered
    expect(getByTestId("exercise-detail-add-to-timer-btn")).toBeTruthy();
    expect(queryByTestId("exercise-picker-close-btn")).toBeNull();

    // Verify detail back button is transparent
    const detailBackBtn = getByTestId("exercise-detail-back-btn");
    const style = StyleSheet.flatten(detailBackBtn.props.style);
    expect(style.backgroundColor).toBe("transparent");
    expect(style.marginLeft).toBe(-10);

    // Press detail back button to return to catalog
    fireEvent.press(detailBackBtn);
    expect(getByPlaceholderText("Search exercises...")).toBeTruthy();
  });

  it("applies marginHorizontal: Spacing.md and unclipped shadows to cards and search bar without container clipping", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ExercisePickerView onSelect={jest.fn()} />
    );

    const searchBar = getByTestId("exercise-search-bar");
    const searchStyle = StyleSheet.flatten(searchBar.props.style);
    expect(searchStyle.marginHorizontal).toBe(Spacing.md);
    expect(searchStyle.shadowOpacity ?? searchStyle.elevation).toBeTruthy();

    const card = getByTestId("exercise-card-tibialis_raises");
    const cardStyle = StyleSheet.flatten(card.props.style);
    expect(cardStyle.marginHorizontal).toBe(Spacing.md);
    expect(cardStyle.shadowOpacity ?? cardStyle.elevation).toBeTruthy();
  });

  it("provides edge-to-edge filter carousels with 16px contentContainerStyle padding and no artificial top padding on listContent", () => {
    const { getByTestId } = render(
      <ExercisePickerView onSelect={jest.fn()} />
    );

    const categoriesCarousel = getByTestId("categories-carousel");
    const catStyle = StyleSheet.flatten(categoriesCarousel.props.contentContainerStyle);
    expect(catStyle.paddingHorizontal).toBe(Spacing.md);

    const bodyPartsCarousel = getByTestId("body-parts-carousel");
    const bpStyle = StyleSheet.flatten(bodyPartsCarousel.props.contentContainerStyle);
    expect(bpStyle.paddingHorizontal).toBe(Spacing.md);
  });
});

