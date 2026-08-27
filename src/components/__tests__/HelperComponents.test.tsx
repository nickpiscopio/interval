import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ImageButton } from "../ImageButton";
import { IntervalImage } from "../../enum/IntervalImage";
import { Spacer } from "../Spacer";
import { StyledText } from "../StyledText";

describe("Helper Components", () => {
  it("renders ImageButton and handles onPress", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ImageButton
        intervalImage={IntervalImage.save}
        onPress={onPress}
        style={{ width: 44 }}
      />
    );

    const icon = getByTestId("icon-content-save");
    fireEvent.press(icon);
    expect(onPress).toHaveBeenCalled();
  });

  it("renders Spacer component", () => {
    const { toJSON } = render(<Spacer />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders StyledText with custom style and text", () => {
    const { getByText } = render(
      <StyledText text="Styled Text Content" style={{ fontSize: 16 }} />
    );
    expect(getByText("Styled Text Content")).toBeTruthy();
  });
});
