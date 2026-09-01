const WHITE = "#FFFFFF";
const TRANSPARENT = "#00FFFFFF";
const BLACK = "#000000";

// Primary Brand Colors
const PRIMARY = "#1A6CCC";
const PRIMARY_DARK = "#002080";

// AI Gradient (Left to Right)
const AI_GRADIENT_START = "#1A6CCC";
const AI_GRADIENT_END = "#1ACC6C";

// Accent / Success Colors
const ACCENT = "#1ACC6C";
const ACCENT_DARK = "#10B981";

// Destructive / Warning Colors
const DESTRUCTIVE = "#E63946";
const DESTRUCTIVE_SURFACE = "#FFF5F5";
const WARNING = "#CC1A1A";
const WARNING_DARK = "#871212";

// Neutral Actions
const NEUTRAL_ACTION_TEXT = "#4B5563";
const NEUTRAL_ACTION_BORDER = "#D1D5DB";
const NEUTRAL_ACTION_SURFACE = "#F3F4F6";

// Gradients & Shadows
const GRADIENT_PRIMARY = "#114582";
const GRADIENT_PRIMARY_DARK = "#000036";
const SHADOW = "#52006A";

// Semantic Text Scale
const TEXT_PRIMARY = "#1F2937";
const TEXT_HEADING = "#374151";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const TEXT_INACTIVE = "#D1D5DB";
const TEXT_INVERSE = "#FFFFFF";

// Surfaces & Borders
const SURFACE_SCREEN = "#F9FAFB";
const SURFACE_CARD = "#FFFFFF";
const BORDER_DEFAULT = "#E5E7EB";
const BORDER_INPUT = "#D1D5DB";

// Default Expo Theme Colors
const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

export default {
  // Brand Tokens
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  accent: ACCENT,
  accentDark: ACCENT_DARK,

  // AI Gradient Definition (Left-to-Right)
  aiGradient: [AI_GRADIENT_START, AI_GRADIENT_END] as [string, string],
  aiGradientCoordinates: {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Action Button Tokens
  destructive: DESTRUCTIVE,
  destructiveSurface: DESTRUCTIVE_SURFACE,
  neutralAction: {
    text: NEUTRAL_ACTION_TEXT,
    border: NEUTRAL_ACTION_BORDER,
    surface: NEUTRAL_ACTION_SURFACE,
  },

  // Semantic Text Tokens
  textScale: {
    primary: TEXT_PRIMARY,
    heading: TEXT_HEADING,
    secondary: TEXT_SECONDARY,
    muted: TEXT_MUTED,
    inactive: TEXT_INACTIVE,
    inverse: TEXT_INVERSE,
  },

  // Surfaces & Borders
  surface: {
    screen: SURFACE_SCREEN,
    card: SURFACE_CARD,
    tintActive: "#EFF6FF",
    overlay: "rgba(0, 0, 0, 0.4)",
    floatingNav: "rgba(255, 255, 255, 0.88)",
  },
  white: WHITE,
  black: BLACK,
  transparent: TRANSPARENT,
  borderDefault: BORDER_DEFAULT,
  borderInput: BORDER_INPUT,

  // Legacy / Backward-Compatible Mappings
  warning: WARNING,
  warningDark: WARNING_DARK,
  gradientPrimary: GRADIENT_PRIMARY,
  gradientPrimaryDark: GRADIENT_PRIMARY_DARK,
  shadow: SHADOW,
  border: TEXT_SECONDARY,
  borderTitle: TEXT_SECONDARY,
  inputTitle: TEXT_SECONDARY,
  inputTitleBackground: WHITE,
  timerText: TEXT_INVERSE,
  text: TEXT_PRIMARY,
  textLight: TEXT_INVERSE,
  textPlaceholder: TEXT_MUTED,
  textPrefix: TEXT_MUTED,
  background: {
    button: {
      image: {
        unpressed: WHITE,
        transparent: TRANSPARENT,
        pressedFullOpacity: BLACK,
      },
    },
  },
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};
