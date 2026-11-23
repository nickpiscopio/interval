import React from "react";
import { Modal, StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { CustomAlertModal } from "../CustomAlertModal";
import Colors from "../../constants/Colors";
import Spacing from "../../constants/Spacing";

const ReactNative = require("react-native");
const SafeAreaContext = require("react-native-safe-area-context");

describe("CustomAlertModal Component", () => {
  it("renders nothing when options is null or visible is false", () => {
    const { queryByText } = render(
      <CustomAlertModal visible={false} options={null} onDismiss={jest.fn()} />
    );
    expect(queryByText("Alert Title")).toBeNull();
  });

  it("renders alert modal with title, message, and buttons", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();

    const { getByText } = render(
      <CustomAlertModal
        visible={true}
        options={{
          title: "Delete Workout?",
          message: "This action cannot be undone.",
          icon: "trash",
          buttons: [
            { text: "Cancel", style: "cancel", onPress: onCancel },
            { text: "Delete", style: "destructive", onPress: onConfirm },
          ],
        }}
        onDismiss={onDismiss}
      />
    );

    expect(getByText("Delete Workout?")).toBeTruthy();
    expect(getByText("This action cannot be undone.")).toBeTruthy();

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);
    expect(onCancel).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();

    const deleteButton = getByText("Delete");
    fireEvent.press(deleteButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("handles backdrop press when cancelable is true and false", () => {
    const onCancel = jest.fn();
    const onDismiss = jest.fn();

    const { getByTestId } = render(
      <CustomAlertModal
        visible={true}
        options={{
          title: "Dismissible Alert",
          cancelable: true,
          buttons: [{ text: "Cancel", style: "cancel", onPress: onCancel }],
        }}
        onDismiss={onDismiss}
      />
    );

    // Press backdrop
    const backdrop = getByTestId("custom-alert-backdrop");
    fireEvent.press(backdrop);
    expect(onCancel).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders single default OK button when no buttons provided", () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <CustomAlertModal
        visible={true}
        options={{
          title: "Notice",
          message: "Saved successfully.",
          icon: "success",
        }}
        onDismiss={onDismiss}
      />
    );

    expect(getByText("Notice")).toBeTruthy();
    const okButton = getByText("OK");
    fireEvent.press(okButton);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders all icon variations correctly", () => {
    const icons = ["warning", "error", "info", "help", "trash", "success"] as const;
    for (const icon of icons) {
      const { getByText } = render(
        <CustomAlertModal
          visible={true}
          options={{
            title: `Title ${icon}`,
            icon,
          }}
          onDismiss={jest.fn()}
        />
      );
      expect(getByText(`Title ${icon}`)).toBeTruthy();
    }
  });

  it("configures Modal with statusBarTranslucent and navigationBarTranslucent and renders a full-bleed sibling backdrop behind the card", () => {
    const onDismiss = jest.fn();
    const { UNSAFE_getByType, getByTestId } = render(
      <CustomAlertModal
        visible={true}
        options={{
          title: "Non-cancelable Alert",
          message: "Please choose an option.",
          cancelable: false,
        }}
        onDismiss={onDismiss}
      />
    );

    const modal = UNSAFE_getByType(Modal);
    expect(modal.props.statusBarTranslucent).toBe(true);
    expect(modal.props.navigationBarTranslucent).toBe(true);

    const backdrop = getByTestId("custom-alert-backdrop");
    const backdropStyle = StyleSheet.flatten(backdrop.props.style);
    expect(backdropStyle.position).toBe("absolute");
    expect(backdropStyle.top).toBe(0);
    expect(backdropStyle.right).toBe(0);
    expect(backdropStyle.bottom).toBe(0);
    expect(backdropStyle.left).toBe(0);
    expect(backdropStyle.backgroundColor).toBe(Colors.surface.overlay);

    // Backdrop must be a sibling behind the card, not wrapping the card
    const card = getByTestId("custom-alert-card");
    let ancestor = card.parent;
    while (ancestor) {
      expect(ancestor).not.toBe(backdrop);
      ancestor = ancestor.parent;
    }

    // When cancelable is false, pressing backdrop does not dismiss
    fireEvent.press(backdrop);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("enforces horizontal margins of at least Spacing.lg, 340px maxWidth, and 85% safe-area maxHeight without fixed height in portrait", () => {
    const dimSpy = jest.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
      width: 360,
      height: 640,
      scale: 2,
      fontScale: 1,
    });
    const insetsSpy = jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
      top: 24,
      bottom: 16,
      left: 0,
      right: 0,
    });

    try {
      const { getByTestId, rerender } = render(
        <CustomAlertModal
          visible={true}
          options={{
            title: "Voice Control",
            message: "Say pause or resume.",
          }}
          onDismiss={jest.fn()}
        />
      );

      const containerStyle = StyleSheet.flatten(
        getByTestId("custom-alert-card-container").props.style
      );
      expect(containerStyle.paddingLeft).toBe(Spacing.lg);
      expect(containerStyle.paddingRight).toBe(Spacing.lg);
      expect(containerStyle.paddingTop).toBe(24);
      expect(containerStyle.paddingBottom).toBe(16);

      const cardStyle = StyleSheet.flatten(getByTestId("custom-alert-card").props.style);
      expect(cardStyle.width).toBe(360 - Spacing.lg * 2);
      expect(cardStyle.maxWidth).toBe(340);
      expect(cardStyle.maxHeight).toBeCloseTo((640 - 24 - 16) * 0.85, 5);
      expect(cardStyle.height).toBeUndefined();

      // On wider portrait screen, width is capped at 340px
      dimSpy.mockReturnValue({ width: 430, height: 932, scale: 3, fontScale: 1 });
      insetsSpy.mockReturnValue({ top: 59, bottom: 34, left: 0, right: 0 });
      rerender(
        <CustomAlertModal
          visible={true}
          options={{
            title: "Voice Control",
            message: "Say pause or resume.",
          }}
          onDismiss={jest.fn()}
        />
      );

      const wideCardStyle = StyleSheet.flatten(getByTestId("custom-alert-card").props.style);
      expect(wideCardStyle.width).toBe(340);
      expect(wideCardStyle.maxWidth).toBe(340);
      expect(wideCardStyle.maxHeight).toBeCloseTo((932 - 59 - 34) * 0.85, 5);
      expect(wideCardStyle.height).toBeUndefined();
    } finally {
      dimSpy.mockRestore();
      insetsSpy.mockRestore();
    }
  });

  it("respects landscape horizontal and vertical safe-area insets plus Spacing.lg margins", () => {
    const dimSpy = jest.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
      width: 420,
      height: 320,
      scale: 2,
      fontScale: 1,
    });
    const insetsSpy = jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
      top: 0,
      bottom: 21,
      left: 44,
      right: 44,
    });

    try {
      const { getByTestId } = render(
        <CustomAlertModal
          visible={true}
          options={{
            title: "Landscape Alert",
            message: "Long message content.",
          }}
          onDismiss={jest.fn()}
        />
      );

      const containerStyle = StyleSheet.flatten(
        getByTestId("custom-alert-card-container").props.style
      );
      expect(containerStyle.paddingLeft).toBe(44 + Spacing.lg);
      expect(containerStyle.paddingRight).toBe(44 + Spacing.lg);
      expect(containerStyle.paddingTop).toBe(0);
      expect(containerStyle.paddingBottom).toBe(21);

      const cardStyle = StyleSheet.flatten(getByTestId("custom-alert-card").props.style);
      expect(cardStyle.width).toBe(420 - (44 + Spacing.lg) * 2);
      expect(cardStyle.maxWidth).toBe(340);
      expect(cardStyle.maxHeight).toBeCloseTo((320 - 0 - 21) * 0.85, 5);
    } finally {
      dimSpy.mockRestore();
      insetsSpy.mockRestore();
    }
  });

  it("pins header (icon and title) and action buttons outside a shrink-wrapping scrollable message ScrollView with visible scroll indicator", () => {
    const { getByTestId, getByText, queryByTestId, rerender } = render(
      <CustomAlertModal
        visible={true}
        options={{
          title: "Voice Control Commands",
          message: "Long voice control instructions that may overflow on compact screens.",
          icon: "info",
          buttons: [
            { text: "Cancel", style: "cancel" },
            { text: "Got It", style: "default" },
          ],
        }}
        onDismiss={jest.fn()}
      />
    );

    const scrollView = getByTestId("custom-alert-message-scroll");
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(true);

    const scrollStyle = StyleSheet.flatten(scrollView.props.style);
    expect(scrollStyle.flexGrow).toBe(0);
    expect(scrollStyle.flexShrink).toBe(1);

    const isDescendantOf = (node: any, ancestor: any) => {
      let current = node.parent;
      while (current) {
        if (current === ancestor) return true;
        current = current.parent;
      }
      return false;
    };

    // Only message is inside the ScrollView
    expect(
      isDescendantOf(
        getByText("Long voice control instructions that may overflow on compact screens."),
        scrollView
      )
    ).toBe(true);

    // Header (icon + title) and buttons are pinned outside the ScrollView
    const header = getByTestId("custom-alert-header");
    const buttons = getByTestId("custom-alert-buttons");
    expect(isDescendantOf(getByTestId("icon-information-circle-outline"), scrollView)).toBe(false);
    expect(isDescendantOf(getByText("Voice Control Commands"), scrollView)).toBe(false);
    expect(isDescendantOf(getByText("Cancel"), scrollView)).toBe(false);
    expect(isDescendantOf(getByText("Got It"), scrollView)).toBe(false);
    expect(isDescendantOf(getByTestId("icon-information-circle-outline"), header)).toBe(true);
    expect(isDescendantOf(getByText("Voice Control Commands"), header)).toBe(true);
    expect(isDescendantOf(getByText("Cancel"), buttons)).toBe(true);
    expect(isDescendantOf(getByText("Got It"), buttons)).toBe(true);

    expect(StyleSheet.flatten(header.props.style).flexShrink).toBe(0);
    expect(StyleSheet.flatten(buttons.props.style).flexShrink).toBe(0);

    // Omitting message omits the ScrollView
    rerender(
      <CustomAlertModal
        visible={true}
        options={{
          title: "No Message Alert",
        }}
        onDismiss={jest.fn()}
      />
    );
    expect(queryByTestId("custom-alert-message-scroll")).toBeNull();
  });
});
