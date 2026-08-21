# 10. 8-Point Grid System and Accessible Dynamic Scaling

We decided to establish an 8-point grid system for all layout dimensions, margins, paddings, and border radii across the application, combined with an accessible dynamic scaling architecture:

1. **8-Point Spacing Scale**: Base spacing tokens defined in multiples of 8 (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `2xl: 40`, `3xl: 48`, `4xl: 56`, `5xl: 64`), where `4px` is reserved as a half-step for micro-insets and inline gaps.
2. **No Fixed Element Heights**: Disallow rigid `height` attributes on interactive containers and text blocks. Instead, use `minHeight: 48` (ensuring touch targets meet accessibility standards at default scale) along with 8pt vertical padding.
3. **Dynamic Type & Wrapping**: Allow all text and button contents to flow naturally and wrap as users increase device font scaling, avoiding text truncation.
