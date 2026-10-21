import React from "react";
import { BackHandler, Dimensions, StyleSheet, Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { BottomSheetFrame } from "../BottomSheetFrame";
import Spacing from "../../constants/Spacing";

type BackListener = () => boolean | null | undefined;

describe("BottomSheetFrame", () => {
  let listeners: BackListener[];

  beforeEach(() => {
    listeners = [];
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_event, handler) => {
      listeners.push(handler as BackListener);
      return {
        remove: () => {
          listeners = listeners.filter((l) => l !== handler);
        },
      } as ReturnType<typeof BackHandler.addEventListener>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mimics RN: handlers run most-recently-registered first until one consumes.
  function pressBack(): boolean {
    for (let i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i]()) return true;
    }
    return false;
  }

  function sheetProps(utils: ReturnType<typeof render>) {
    return utils.getByTestId("bottom-sheet-modal").props.sheetProps;
  }

  it("renders its children", () => {
    const { getByText } = render(
      <BottomSheetFrame visible onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheetFrame>
    );
    expect(getByText("Sheet body")).toBeTruthy();
  });

  it("renders no drag handle", () => {
    const utils = render(
      <BottomSheetFrame visible onClose={jest.fn()}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    expect(sheetProps(utils).handleComponent).toBeNull();
    expect(sheetProps(utils).handleIndicatorStyle).toBeUndefined();
  });

  it("disables swipe and pan dismissal", () => {
    const utils = render(
      <BottomSheetFrame visible onClose={jest.fn()}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    const props = sheetProps(utils);
    expect(props.enablePanDownToClose).toBe(false);
    expect(props.enableHandlePanningGesture).toBe(false);
    expect(props.enableContentPanningGesture).toBe(false);
  });

  it("sizes dynamically capped at 90% of screen height with no snap points", () => {
    const utils = render(
      <BottomSheetFrame visible onClose={jest.fn()}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    const props = sheetProps(utils);
    expect(props.enableDynamicSizing).toBe(true);
    expect(props.maxDynamicContentSize).toBeCloseTo(Dimensions.get("window").height * 0.9);
    expect(props.snapPoints).toBeUndefined();
  });

  it("pads 16px on top and sides, and bottom respects the safe-area inset", () => {
    const { getByTestId } = render(
      <BottomSheetFrame visible onClose={jest.fn()}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    const style = StyleSheet.flatten(getByTestId("bottom-sheet-content").props.style);
    expect(style.paddingTop).toBe(Spacing.md);
    expect(style.paddingHorizontal).toBe(Spacing.md);
    // Mocked safe-area bottom inset is 34.
    expect(style.paddingBottom).toBe(34);
  });

  it("calls onClose when the backdrop is tapped", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <BottomSheetFrame visible onClose={onClose}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    fireEvent.press(getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes and consumes the Android back press while visible", () => {
    const onClose = jest.fn();
    render(
      <BottomSheetFrame visible onClose={onClose}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    expect(pressBack()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes only the topmost sheet when two are stacked", () => {
    const lower = jest.fn();
    const upper = jest.fn();
    render(
      <>
        <BottomSheetFrame visible onClose={lower}>
          <Text>lower</Text>
        </BottomSheetFrame>
        <BottomSheetFrame visible onClose={upper}>
          <Text>upper</Text>
        </BottomSheetFrame>
      </>
    );
    expect(pressBack()).toBe(true);
    expect(upper).toHaveBeenCalledTimes(1);
    expect(lower).not.toHaveBeenCalled();
  });

  it("does not intercept back when not visible", () => {
    const onClose = jest.fn();
    render(
      <BottomSheetFrame visible={false} onClose={onClose}>
        <Text>x</Text>
      </BottomSheetFrame>
    );
    expect(pressBack()).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("supports explicit snapPoints and disables dynamic sizing", () => {
    const utils = render(
      <BottomSheetFrame visible onClose={jest.fn()} snapPoints={["90%"]}>
        <Text>custom snap points</Text>
      </BottomSheetFrame>
    );
    const props = sheetProps(utils);
    expect(props.enableDynamicSizing).toBe(false);
    expect(props.snapPoints).toEqual(["90%"]);
    expect(props.maxDynamicContentSize).toBeUndefined();
  });

  it("does not call onClose when dismissed programmatically via visible change", () => {
    const onClose = jest.fn();
    const { rerender, getByTestId } = render(
      <BottomSheetFrame visible onClose={onClose}>
        <Text>sheet</Text>
      </BottomSheetFrame>
    );

    // Programmatically dismiss by setting visible to false
    rerender(
      <BottomSheetFrame visible={false} onClose={onClose}>
        <Text>sheet</Text>
      </BottomSheetFrame>
    );

    // Trigger onDismiss handler that bottom sheet fires when dismiss completes
    const modal = getByTestId("bottom-sheet-modal");
    modal.props.sheetProps.onDismiss();

    expect(onClose).not.toHaveBeenCalled();
  });
});

