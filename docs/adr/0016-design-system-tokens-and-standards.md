# 16. Design System Tokens and Standards

We decided to establish a comprehensive, single-source-of-truth design system covering color tokens, typography scales, spacing aliases, surface semantics, and modal/bottom sheet transitions.

1. **Color Palette & Actions**:
   - **Primary**: `#1A6CCC` for positive primary CTAs and active states.
   - **AI Features**: Left-to-Right linear gradient (`["#1A6CCC", "#1ACC6C"]`, `start: { x: 0, y: 0 }`, `end: { x: 1, y: 0 }`).
   - **Destructive**: `#E63946` text/border with `#FFF5F5` surface.
   - **Neutral Action**: `#4B5563` text/icon with `#D1D5DB` border and `#F3F4F6` surface.
   - **Semantic Text Scale**: `primary: "#1F2937"`, `heading: "#374151"`, `secondary: "#6B7280"`, `muted: "#9CA3AF"`, `inactive: "#D1D5DB"`, `inverse: "#FFFFFF"`.
   - **Surfaces & Borders**: `surface.screen: "#F9FAFB"`, `surface.card: "#FFFFFF"`, `border.default: "#E5E7EB"`, `border.input: "#D1D5DB"`.
2. **Spacing & Layout**:
   - **Scale**: Multiples of 8 (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `2xl: 40`, `3xl: 48`, `4xl: 56`, `5xl: 64`).
   - **Aliases**: `Spacing.screen: 16` (`Spacing.md`), `Spacing.cardGap: 8` (`Spacing.sm`).
   - **Radii**: `radius.sm: 8` (inputs/buttons), `radius.md: 16` (cards/panels), `radius.lg: 24` (bottom sheets), `radius.full: 9999` (circular pills).
   - **Touch Targets**: `touchTarget.min: 48`, `touchTarget.cta: 56`.
3. **Typography**:
   - **Font Families**: `regular: "Poppins-Regular"`, `medium: "Poppins-Medium"`, `bold: "Poppins-Bold"`.
   - **Scale**: `xs: 12/16`, `sm: 14/20`, `md: 16/24`, `lg: 20/28`, `xl: 24/32`, `2xl: 28/36`, `3xl: 32/40`.
4. **Bottom Sheets & Modals Standard**:
   - **Backdrop**: Translucent darkened overlay (`rgba(0, 0, 0, 0.4)` to `rgba(0, 0, 0, 0.5)`) with animated **opacity fade-in** (`opacity: 0 -> 1`).
   - **Sheet Transitions**: Bottom sheets must use **slide up** transitions (`animationType="slide"`).
   - **Corners**: Rounded top corners (`borderTopLeftRadius: Spacing.radius.lg`, `borderTopRightRadius: Spacing.radius.lg`).
   - **Dismissal**: Top-right **"Done"** / close button and tapping the backdrop dismisses the sheet.
