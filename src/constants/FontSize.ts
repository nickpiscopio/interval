export const FONT_FAMILY = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  bold: "Poppins-Bold",
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const LINE_HEIGHT = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  "2xl": 36,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
} as const;

export default {
  ...FONT_SIZE,
  lineHeight: LINE_HEIGHT,
  fontFamily: FONT_FAMILY,

  // Backward compatibility mappings
  input: {
    title: FONT_SIZE.sm,
    prefix: FONT_SIZE.md,
    text: FONT_SIZE.md,
  },
  button: {
    title: FONT_SIZE.md,
  },
};
