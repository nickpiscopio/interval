import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View, useThemeColor } from "../Themed";

describe("Themed Component", () => {
  it("renders Themed Text and View with light/dark colors", () => {
    const { getByText } = render(
      <View lightColor="#FFFFFF" darkColor="#000000">
        <Text lightColor="#111111" darkColor="#EEEEEE">
          Themed Content
        </Text>
      </View>
    );
    expect(getByText("Themed Content")).toBeTruthy();
  });

  it("renders Themed View without color props", () => {
    const { getByText } = render(
      <View>
        <Text>Plain Text</Text>
      </View>
    );
    expect(getByText("Plain Text")).toBeTruthy();
  });

  it("evaluates useThemeColor directly", () => {
    const color = useThemeColor({ light: "#ABCDEF", dark: "#123456" });
    expect(color).toBeTruthy();
    const fallback = useThemeColor({});
    expect(fallback).toBeUndefined();
  });
});
