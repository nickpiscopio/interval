// Documentation: https://www.npmjs.com/package/react-native-gradient-icon
// Icon library: https://oblador.github.io/react-native-vector-icons/
import { Icon } from "react-native-gradient-icon";
import { colorProps } from "react-native-gradient-icon/src/Icon";
import Colors from "../constants/Colors";

const DEFAULT_ICON_SIZE = 24;
const DEFAULT_ICON_TYPE = "material-community";

export type IntervalImage = typeof IntervalImage[keyof typeof IntervalImage];
export const IntervalImage = {
  delete: (
    <Icon
      colors={getColor()}
      start={getStart()}
      end={getEnd()}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="delete"
    />
  ),
  save: (
    <Icon
      colors={getColor()}
      start={getStart()}
      end={getEnd()}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="content-save"
    />
  ),
} as const;

function getColor(): colorProps[] {
  return [
    { color: Colors.primary, offset: "0", opacity: "1" },
    { color: Colors.gradientPrimary, offset: "1", opacity: "1" },
  ];
}

function getStart() {
  return { x: 0, y: 0 };
}

function getEnd() {
  return { x: 1, y: 1 };
}
