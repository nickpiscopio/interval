import { colorProps } from "react-native-gradient-icon/src/Icon";
import Colors from "../constants/Colors";

enum IntervalImageButton {
  SOLID,
  TRANSPARENT,
  POSITIVE,
  WARNING,
}

export type IntervalImageGradient =
  typeof IntervalImageGradient[keyof typeof IntervalImageGradient];
export const IntervalImageGradient = {
  colors: {
    solid: {
      asProps: getColorAsProps(IntervalImageButton.SOLID),
      asStrings: getColorAsStrings(IntervalImageButton.SOLID),
    },
    transparent: {
      asProps: getColorAsProps(IntervalImageButton.TRANSPARENT),
      asStrings: getColorAsStrings(IntervalImageButton.TRANSPARENT),
    },
    positive: {
      asProps: getColorAsProps(IntervalImageButton.POSITIVE),
      asStrings: getColorAsStrings(IntervalImageButton.POSITIVE),
    },
    warning: {
      asProps: getColorAsProps(IntervalImageButton.WARNING),
      asStrings: getColorAsStrings(IntervalImageButton.WARNING),
    },
  },
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

function getColorAsProps(type: IntervalImageButton): colorProps[] {
  let colors = getColorAsStrings(type);

  return [
    { color: colors[0], offset: "0", opacity: "1" },
    { color: colors[1], offset: "1", opacity: "1" },
  ];
}

function getColorAsStrings(type: IntervalImageButton): string[] {
  let color1 = Colors.primary;
  let color2 = Colors.gradientPrimaryDark;

  switch (type) {
    case IntervalImageButton.SOLID:
      color1 = Colors.background.button.image.unpressed;
      color2 = Colors.background.button.image.unpressed;
      break;
    case IntervalImageButton.TRANSPARENT:
      color1 = Colors.background.button.image.transparent;
      color2 = Colors.background.button.image.transparent;
      break;
    case IntervalImageButton.POSITIVE:
      color1 = Colors.primary;
      color2 = Colors.gradientPrimary;
      break;
    case IntervalImageButton.WARNING:
      color1 = Colors.warning;
      color2 = Colors.warningDark;
      break;
  }

  return [color1, color2];
}
