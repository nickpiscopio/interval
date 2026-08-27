import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CustomAlertModal } from "../CustomAlertModal";

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
});
