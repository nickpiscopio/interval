// Documentation: https://www.npmjs.com/package/react-native-gradient-icon
// Icon library: https://oblador.github.io/react-native-vector-icons/
import { Icon } from "react-native-gradient-icon";
import { IntervalImageGradient } from "./IntervalImageGradient";

const DEFAULT_ICON_SIZE = 24;
const DEFAULT_ICON_TYPE = "material-community";

export type IntervalImage = typeof IntervalImage[keyof typeof IntervalImage];
export const IntervalImage = {
  delete: (
    <Icon
      colors={IntervalImageGradient.colors.warning.asProps}
      start={IntervalImageGradient.start}
      end={IntervalImageGradient.end}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="delete"
    />
  ),
  save: (
    <Icon
      colors={IntervalImageGradient.colors.positive.asProps}
      start={IntervalImageGradient.start}
      end={IntervalImageGradient.end}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="content-save"
    />
  ),
  play: (
    <Icon
      colors={IntervalImageGradient.colors.solid.asProps}
      start={IntervalImageGradient.start}
      end={IntervalImageGradient.end}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="play"
    />
  ),
  pause: (
    <Icon
      colors={IntervalImageGradient.colors.solid.asProps}
      start={IntervalImageGradient.start}
      end={IntervalImageGradient.end}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="pause"
    />
  ),
  close: (
    <Icon
      colors={IntervalImageGradient.colors.solid.asProps}
      start={IntervalImageGradient.start}
      end={IntervalImageGradient.end}
      size={DEFAULT_ICON_SIZE}
      type={DEFAULT_ICON_TYPE}
      name="close"
    />
  ),
} as const;
