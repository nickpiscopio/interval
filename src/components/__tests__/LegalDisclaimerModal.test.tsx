import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { LegalDisclaimerModal } from "../LegalDisclaimerModal";
import Spacing, { TOUCH_TARGET } from "../../constants/Spacing";

describe("LegalDisclaimerModal Component", () => {
  it("renders in gate mode full-screen without warning badge and triggers onAccept when agree button is pressed", () => {
    const onAccept = jest.fn();

    const { getByText, getByTestId, queryByTestId, queryByText } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="gate"
        onAccept={onAccept}
      />
    );

    expect(queryByText("IMPORTANT SAFETY & HEALTH NOTICE")).toBeNull();
    expect(getByText("Legal & Medical Disclaimer")).toBeTruthy();
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

  it("renders in review mode via BottomSheetFrame with shortened title, no warning badge, Spacing.sm below agreed badge, and triggers onClose", () => {
    const onClose = jest.fn();

    const { getByText, getByTestId, queryByText } = render(
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

    // Header hierarchy elements
    const title = getByText("Legal & Medical Disclaimer");
    const version = getByText("Interval v2.4.0");
    const agreedBadge = getByText("Agreed on Aug 27, 2026");
    const subtitle = getByText(/Please read carefully before using Interval/);

    expect(title).toBeTruthy();
    expect(version).toBeTruthy();
    expect(queryByText("IMPORTANT SAFETY & HEALTH NOTICE")).toBeNull();
    expect(agreedBadge).toBeTruthy();
    expect(subtitle).toBeTruthy();

    const badgesRowStyle = StyleSheet.flatten(getByTestId("legal-badges-row").props.style);
    expect(badgesRowStyle.marginBottom).toBe(Spacing.sm);

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

  it("uses edge-to-edge scroll layout with card horizontal margins in gate mode", () => {
    const { getByTestId, getAllByTestId } = render(
      <LegalDisclaimerModal visible={true} mode="gate" />
    );

    const scrollView = getByTestId("legal-scroll-view");
    const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);
    expect(contentStyle.paddingHorizontal ?? 0).toBe(0);
    expect(contentStyle.paddingLeft ?? 0).toBe(0);
    expect(contentStyle.paddingRight ?? 0).toBe(0);

    const cards = getAllByTestId("legal-card");
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      const cardStyle = StyleSheet.flatten(card.props.style);
      expect(cardStyle.marginHorizontal).toBe(Spacing.md);
    }
  });

  it("uses noPadding BottomSheetFrame, padded sheet header, and edge-to-edge card margins in review mode", () => {
    const { getByTestId, getAllByTestId } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="review"
        appVersion="2.4.0"
        acceptedDate="Aug 27, 2026"
      />
    );

    const sheetContentStyle = StyleSheet.flatten(
      getByTestId("bottom-sheet-content").props.style
    );
    expect(sheetContentStyle.paddingHorizontal).toBe(0);
    expect(sheetContentStyle.paddingTop).toBe(0);

    const sheetHeaderStyle = StyleSheet.flatten(
      getByTestId("legal-sheet-header").props.style
    );
    expect(sheetHeaderStyle.paddingHorizontal).toBe(Spacing.md);
    expect(sheetHeaderStyle.paddingTop).toBe(Spacing.md);

    const scrollView = getByTestId("legal-scroll-view");
    const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);
    expect(contentStyle.paddingHorizontal ?? 0).toBe(0);
    expect(contentStyle.paddingLeft ?? 0).toBe(0);
    expect(contentStyle.paddingRight ?? 0).toBe(0);

    const cards = getAllByTestId("legal-card");
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      const cardStyle = StyleSheet.flatten(card.props.style);
      expect(cardStyle.marginHorizontal).toBe(Spacing.md);
    }
  });

  it("begins the review scroll viewport flush beneath the header divider with Spacing.md top scroll padding", () => {
    const { getByTestId } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="review"
        appVersion="2.4.0"
        acceptedDate="Aug 27, 2026"
      />
    );

    const sheetHeaderStyle = StyleSheet.flatten(
      getByTestId("legal-sheet-header").props.style
    );
    expect(sheetHeaderStyle.marginBottom ?? 0).toBe(0);

    const scrollView = getByTestId("legal-scroll-view");
    const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);
    expect(contentStyle.paddingTop).toBe(Spacing.md);
  });

  it("top-aligns the review header row and optically aligns the close button in the upper-right corner", () => {
    const { getByTestId } = render(
      <LegalDisclaimerModal
        visible={true}
        mode="review"
        appVersion="2.4.0"
        acceptedDate="Aug 27, 2026"
      />
    );

    const headerRowStyle = StyleSheet.flatten(
      getByTestId("legal-header-row").props.style
    );
    expect(headerRowStyle.alignItems).toBe("flex-start");

    const closeBtnStyle = StyleSheet.flatten(
      getByTestId("legal-modal-close-btn").props.style
    );
    expect(closeBtnStyle.width).toBe(TOUCH_TARGET.icon);
    expect(closeBtnStyle.height).toBe(TOUCH_TARGET.icon);
    expect(closeBtnStyle.marginTop).toBeLessThan(0);
    expect(closeBtnStyle.marginTop).toBeGreaterThanOrEqual(-Spacing.md);
    expect(closeBtnStyle.marginRight).toBeLessThan(0);
    expect(closeBtnStyle.marginRight).toBeGreaterThanOrEqual(-Spacing.md);
  });
});
