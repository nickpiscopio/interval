# Design System Rule

Whenever creating, modifying, or refactoring UI components, layouts, or screens in this repository, you MUST strictly adhere to the design system.

There should **NEVER** be an instance where colors, sizes, or spacing are hardcoded. These must all come from the design system tokens. Buttons, cards, shadows, text buttons, text fields, icon buttons, and corner radii must remain 100% consistent across all screens.

---

## 1. Zero Hardcoding Policy
- **Colors**: Always import from `src/constants/Colors.ts`. Never use hardcoded hex codes, RGB(A) literals, or generic color strings.
- **Spacing**: Always import from `src/constants/Spacing.ts` (`Spacing.xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `screen: 16`, `cardGap: 8`).
- **Typography & Font Sizes**: Always import from `src/constants/FontSize.ts`.
- **Corner Radii**: Always import from `RADIUS` in `src/constants/Spacing.ts`.
- **Shadows**: Always import from `SHADOWS` in `src/constants/Spacing.ts`.
- **Touch Targets**: Always import from `TOUCH_TARGET` in `src/constants/Spacing.ts`.

---

## 2. 4-Tier Semantic Corner Radii Scale
- **`RADIUS.sm` (8px)**: Interactive controls (text inputs, control panel icon buttons, chips/tags).
- **`RADIUS.md` (16px)**: Surface cards, CTA buttons, alert dialogs, modal cards.
- **`RADIUS.lg` (24px)**: Bottom sheets and drawer modals (top corners: `borderTopLeftRadius: RADIUS.lg`, `borderTopRightRadius: RADIUS.lg`).
- **`RADIUS.full` (9999px / Circular)**: Floating navigation bar, primary FABs, status pills, circular back/close buttons, badges.

---

## 3. Component Primitive Standards

### A. Universal Bold Button Typography
- **100% of buttons with text** (primary CTAs, secondary action cards, text/ghost links, dialog actions, modal buttons) MUST use bold lettering (`fontFamily: "Poppins-Bold"` and `fontWeight: "700"`).

### B. Icon + Text Button Padding
- Buttons containing both an icon and text must maintain enhanced breathing room:
  - **Icon-to-Text Spacing**: 8px (`gap: Spacing.sm` or `marginRight: Spacing.sm`).
  - **Button Padding**: `paddingHorizontal: Spacing.lg` (24px) and `paddingVertical: Spacing.md` (16px).
  - **Icon Weight**: Use solid/filled glyphs (`Ionicons` filled variants) to match bold typography.

### C. Primary CTA Buttons
- Minimum height: `minHeight: TOUCH_TARGET.cta` (56px) or `TOUCH_TARGET.min` (48px).
- Radius: `borderRadius: RADIUS.md` (16px).
- Typography: `fontFamily: "Poppins-Bold"`, white text (`Colors.white`).

### D. Header Back Buttons
- Standard left-aligned back button with transparent background (`backgroundColor: "transparent"`).
- Minimum touch target: 44x44 (`TOUCH_TARGET.icon`).
- Press feedback: `activeOpacity={0.6}` (do NOT trigger haptic feedback on back navigation).
- Standard arrow icon: `Ionicons name="arrow-back"`, 24px, `Colors.textScale.primary`.

### E. Surface Cards & Containers
- Clean borderless surface cards: `backgroundColor: Colors.surface.card`, `borderRadius: RADIUS.md`, `padding: Spacing.md`, `...SHADOWS.card`.
- **Zero borders**: Never add outer card borders (`borderWidth: 0`).
- **Interval Card Color Accent Exception**: Interval list items in `CreateTimerScreen` use `borderLeftWidth: 6` with `borderLeftColor: item.color` for high-contrast interval identity, keeping top, bottom, and right borders at 0.

### F. Text Inputs / Fields
- Minimum height: `minHeight: TOUCH_TARGET.min` (48px).
- Background: `Colors.surface.screen`, border: 1px `Colors.borderInput`, radius: `RADIUS.sm`.
- Text color: `Colors.textScale.primary`.

---

## 4. Dynamic Header Elevation & Scroll Shadows
- **Unscrolled (`offsetY <= 0`)**: Fixed headers blend seamlessly into the screen background (`backgroundColor: Colors.surface.screen`) with zero borders and zero drop shadows.
- **Scrolled (`offsetY > 0`)**: A dynamic 12px directional drop shadow (`LinearGradient colors={["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.05)", "transparent"]}`) appears immediately below the header (`zIndex: 9`, `pointerEvents: "none"`), showing elements flowing naturally behind the header.

---

## 5. Dynamic Type, Accessibility & Scrolling
- **Dynamic Type**: Elements containing text must use `minHeight` instead of rigid fixed `height` so text can scale naturally when users increase device text size without clipping.
- **Floating / Docked Action Bars**: Docked actions must float above the scroll view with standard window padding (`paddingHorizontal: Spacing.screen` / 16px) and safe-area insets (`paddingBottom: Math.max(insets.bottom, Spacing.md)`).
- **Dynamic Scroll Cushion**: Any scrollable view with a fixed or floating bottom bar must measure the dock height dynamically and pad the scroll content so all elements remain fully viewable.

---

## 6. Standardized Shadow Presets (`SHADOWS`)
- **`SHADOWS.card`**: Surface cards (`shadowOffset: { width: 2, height: 2 }`, `shadowOpacity: 0.05`, `shadowRadius: 4`, `elevation: 1`).
- **`SHADOWS.floating`**: Floating panels and pressed state elevations (`shadowOffset: { width: 4, height: 4 }`, `shadowOpacity: 0.1`, `shadowRadius: 12`, `elevation: 6`).
- **`SHADOWS.fab`**: Floating action buttons (`shadowOffset: { width: 3, height: 3 }`, `shadowOpacity: 0.3`, `shadowRadius: 6`, `elevation: 6`).
- **`SHADOWS.modal`**: Modal sheets and dialogs (`shadowOffset: { width: 0, height: -4 }`, `shadowOpacity: 0.15`, `shadowRadius: 16`, `elevation: 10`).
