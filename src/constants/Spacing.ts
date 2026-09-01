export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 56,
  "5xl": 64,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const TOUCH_TARGET = {
  icon: 44,
  min: 48,
  cta: 56,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  fab: {
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export default {
  ...SPACING,
  radius: RADIUS,
  touchTarget: TOUCH_TARGET,
  shadows: SHADOWS,

  // Layout Semantic Aliases
  screen: SPACING.md, // 16px screen padding / margins
  cardGap: SPACING.sm, // 8px gap between cards and list items

  // Backward compatibility mappings
  window: {
    padding: SPACING.lg, // 24
    small: SPACING.sm,   // 8
  },
  button: {
    vertical: SPACING.md,     // 16
    horizontal: SPACING.lg,   // 24
    borderRadius: RADIUS.lg,  // 24
    minHeight: TOUCH_TARGET.min,
  },
  input: {
    margin: SPACING.md,       // 16
    padding: SPACING.sm,      // 8
    border: {
      width: 2,
      radius: RADIUS.sm,      // 8
    },
    minHeight: TOUCH_TARGET.min,
  },
};
