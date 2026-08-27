import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LegalDisclaimerModal } from "../LegalDisclaimerModal";

describe("LegalDisclaimerModal Component", () => {
  it("renders in gate mode and triggers onAccept when agree button is pressed", () => {
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

    // Tap Agree button
    const agreeBtn = getByTestId("legal-agree-button");
    fireEvent.press(agreeBtn);

    expect(onAccept).toHaveBeenCalled();
  });

  it("renders in review mode and displays version info, agreed date badge, and triggers onClose via top X button", () => {
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

    expect(getByText("Interval v2.4.0")).toBeTruthy();
    expect(getByText("Agreed on Aug 27, 2026")).toBeTruthy();

    // Top X close button
    const topCloseBtn = getByTestId("legal-modal-close-btn");
    fireEvent.press(topCloseBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
