import { colorProps } from "react-native-gradient-icon/src/Icon";
import Colors from "../constants/Colors";

export type IntervalImageGradient =
  typeof IntervalImageGradient[keyof typeof IntervalImageGradient];
export const IntervalImageGradient = {
  colors: {
    positive: {
      asProps: getPostiveColorAsProps(),
      asStrings: getPositiveColorAsStrings(),
    },
    warning: {
      asProps: getWarningColorAsProps(),
      asStrings: getWarningColorAsStrings(),
    },
  },
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

function getPostiveColorAsProps(): colorProps[] {
  return [
    { color: Colors.primary, offset: "0", opacity: "1" },
    { color: Colors.gradientPrimary, offset: "1", opacity: "1" },
  ];
}

function getWarningColorAsProps(): colorProps[] {
  return [
    { color: Colors.warning, offset: "0", opacity: "1" },
    { color: Colors.warningDark, offset: "1", opacity: "1" },
  ];
}

function getPositiveColorAsStrings(): string[] {
  return [Colors.primary, Colors.gradientPrimary];
}

function getWarningColorAsStrings(): string[] {
  return [Colors.warning, Colors.warningDark];
}
