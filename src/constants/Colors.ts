const WHITE = "#FFFFFF"
const PRIMARY = "#1A6CCC";
const PRIMARY_DARK = "#002080";
const GRADIENT_PRIMARY = "#114582";
const GRADIENT_PRIMARY_DARK = "#000036";
const SHADOW = "#52006A";
const TEXT_DARK = "#1a1a1a"
const TEXT_MEDIUM = "#4c4c4c";
const TEXT_LIGHT = "#808080";
const TEXT_X_LIGHT = "#FFFFFF";

// Default from Expo.
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  gradientPrimary: GRADIENT_PRIMARY,
  gradientPrimaryDark: GRADIENT_PRIMARY_DARK,
  shadow: SHADOW,
  border: TEXT_MEDIUM,
  borderTitle: TEXT_MEDIUM,
  inputTitle: TEXT_MEDIUM,
  inputTitleBackground: WHITE,
  timerText: TEXT_X_LIGHT,
  text: TEXT_DARK,
  textLight: TEXT_X_LIGHT,
  textPlaceholder: TEXT_LIGHT,
  textPrefix: TEXT_LIGHT,
  backgroundImageButton: WHITE,
  // Default from Expo.
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
