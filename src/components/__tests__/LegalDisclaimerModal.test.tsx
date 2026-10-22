import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LegalDisclaimerModal } from "../LegalDisclaimerModal";
import { TOUCH_TARGET } from "../../constants/Spacing";

describe("LegalDisclaimerModal Component", () => {
  it("renders in gate mode full-screen and triggers onAccept when agree button is pressed", () => {
    const onAccept = jest.fn();

    const { getByText, getByTestId, queryByTestId } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="gate"
        onAccept={onAccept}
      />
    );

    expect(getByText("IMPORTANT SAFETY & HEALTH NOTICE")).toBeTruthy();
    expect(getByText("Legal Agreement & Medical Disclaimer")).toBeTruthy();
    expect(getByText("1. Voluntary Participation & Assumption of Risk")).toBeTruthy();
    expect(getByText("2. Workout & Physical Therapy Recommendations")).toBeTruthy();
    expect(getByText("3. Mandatory Physician Consultation")).toBeTruthy();
    expect(getByText("4. Limitation of Liability & Safe Practice")).toBeTruthy();

    // Close button should NOT exist in gate mode
    expect(queryByTestId("legal-modal-close-btn")).toBeNull();
    // BottomSheetFrame should not be used in gate mode
    expect(queryByTestId("bottom-sheet-content")).toBeNull();

    // Tap Agree button
    const agreeBtn = getByTestId("legal-agree-button");
    fireEvent.press(agreeBtn);

    expect(onAccept).toHaveBeenCalled();
  });

  it("renders in review mode via BottomSheetFrame with transparent close button, 4-tier header hierarchy, and triggers onClose", () => {
    const onClose = jest.fn();

    const { getByText, getByTestId } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="review"
        appVersion="2.4.0"
        acceptedDate="Aug 27, 2026"
        onClose={onClose}
      />
    );

    // Rendered inside BottomSheetFrame
    expect(getByTestId("bottom-sheet-content")).toBeTruthy();

    // 4-tier header hierarchy elements
    const title = getByText("Legal Agreement & Medical Disclaimer");
    const version = getByText("Interval v2.4.0");
    const warningBadge = getByText("IMPORTANT SAFETY & HEALTH NOTICE");
    const agreedBadge = getByText("Agreed on Aug 27, 2026");
    const subtitle = getByText(/Please read carefully before using Interval/);

    expect(title).toBeTruthy();
    expect(version).toBeTruthy();
    expect(warningBadge).toBeTruthy();
    expect(agreedBadge).toBeTruthy();
    expect(subtitle).toBeTruthy();

    // Top X close button styling: transparent background and 44x44 touch dimensions
    const topCloseBtn = getByTestId("legal-modal-close-btn");
    expect(topCloseBtn.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "transparent",
        width: TOUCH_TARGET.icon,
        height: TOUCH_TARGET.icon,
      })
    );

    // BottomSheetModal receives 90% snap point
    const modal = getByTestId("bottom-sheet-modal");
    expect(modal.props.sheetProps.snapPoints).toEqual(["90%"]);

    fireEvent.press(topCloseBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
