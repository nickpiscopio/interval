# 16. Design System Tokens and Standards

We decided to establish a comprehensive, single-source-of-truth design system covering color tokens, typography scales, spacing aliases, surface semantics, shadow presets, corner radii hierarchy, and modal/bottom sheet transitions with 100% token enforcement (zero hardcoded values).

1. **Color Palette & Actions**:
   - **Primary Brand**: `#1A6CCC` for positive primary CTAs, active highlights, and header actions.
   - **AI Features**: Left-to-Right linear gradient (`["#1A6CCC", "#1ACC6C"]`, `start: { x: 0, y: 0 }`, `end: { x: 1, y: 0 }`).
   - **Destructive**: `#E63946` border/text with `#FFF5F5` surface (`Colors.destructiveSurface`).
   - **Neutral Action**: `#4B5563` text/icon with `#D1D5DB` border and `#F3F4F6` surface (`Colors.neutralAction.surface`).
   - **Semantic Text Scale**: `primary: "#1F2937"`, `heading: "#374151"`, `secondary: "#6B7280"`, `muted: "#9CA3AF"`, `inactive: "#D1D5DB"`, `inverse: "#FFFFFF"`.
   - **Surfaces & Overlays**: `surface.screen: "#F9FAFB"`, `surface.card: "#FFFFFF"`, `surface.tintActive: "#EFF6FF"`, `surface.floatingNav: "rgba(255, 255, 255, 0.88)"`, `surface.overlay: "rgba(0, 0, 0, 0.4)"`.
   - **Borders**: `borderDefault: "#E5E7EB"`, `borderInput: "#D1D5DB"`.

2. **Spacing & 4-Tier Corner Radii Hierarchy**:
   - **Scale**: Multiples of 8 (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `2xl: 40`, `3xl: 48`, `4xl: 56`, `5xl: 64`).
   - **Layout Aliases**: `Spacing.screen: 16` (`Spacing.md`), `Spacing.cardGap: 8` (`Spacing.sm`).
   - **4-Tier Radii Rules**:
     - `RADIUS.sm` (**8px**): Interactive controls (Inputs, Text Fields, standard 44x44 icon buttons, chips).
     - `RADIUS.md` (**16px**): Content cards, dialogs, floating cards, grouped containers, CTA buttons.
     - `RADIUS.lg` (**24px**): Bottom sheets and drawer modals (top corners).
     - `RADIUS.full` (**9999px / Circular**): Floating tab bar, hero FABs, status pills, circular navigation buttons, badges.
   - **Touch Targets**: `touchTarget.icon: 44`, `touchTarget.min: 48`, `touchTarget.cta: 56`.

3. **Standardized Shadow Presets (`SHADOWS`)**:
   - `SHADOWS.card`: Ambient directional elevation for surface cards (`shadowOffset: { width: 2, height: 2 }`, `shadowOpacity: 0.05`, `shadowRadius: 4`, `elevation: 1`).
   - `SHADOWS.floating`: Medium directional elevation for floating panels & bottom cards (`shadowOffset: { width: 4, height: 4 }`, `shadowOpacity: 0.1`, `shadowRadius: 12`, `elevation: 6`).
   - `SHADOWS.fab`: Vibrant colored drop shadow for primary & AI floating action buttons (`shadowOffset: { width: 3, height: 3 }`, `shadowOpacity: 0.3`, `shadowRadius: 6`, `elevation: 6`).
   - `SHADOWS.modal`: Deep backdrop elevation for modals and bottom sheets (`shadowOffset: { width: 0, height: -4 }`, `shadowOpacity: 0.15`, `shadowRadius: 16`, `elevation: 10`).

4. **Component Primitives Standards**:
   - **Universal Bold Button Typography**: 100% of buttons with text (primary CTAs, secondary action cards, text/ghost links, dialog buttons, modal actions) must use bold lettering (`fontFamily: "Poppins-Bold"` / `fontWeight: "700"`).
   - **Icon + Text Button Padding**: Buttons containing both an icon and text must maintain enhanced internal breathing room with `gap: Spacing.sm` (8px) or `marginRight: Spacing.sm` between icon and label, `paddingHorizontal: Spacing.lg` (24px), and `paddingVertical: Spacing.md` (16px).
   - **Primary CTA Buttons**: `minHeight: TOUCH_TARGET.cta` (56px) or `TOUCH_TARGET.min` (48px), `borderRadius: RADIUS.md` (16px), `fontFamily: "Poppins-Bold"`, white text.
   - **Header Back Buttons**: Left-aligned, transparent background (`backgroundColor: "transparent"`), 44x44 touch target (`TOUCH_TARGET.icon`), `activeOpacity: 0.6` press feedback (no haptic trigger), with standard arrow icon (`name="arrow-back"`, 24px, `Colors.textScale.primary`).
   - **Icon Buttons**: Fixed `TOUCH_TARGET.icon` (44px) or `TOUCH_TARGET.min` (48px) with `borderRadius: RADIUS.sm` (8px) for control panels (or `RADIUS.full` for circular navigation/floating buttons). 4 standard variants: `primary`, `neutral`, `destructive`, `ghost`.
   - **Cards & Containers**: Clean borderless surface cards with `backgroundColor: Colors.surface.card`, `borderRadius: RADIUS.md`, `padding: Spacing.md`, `...SHADOWS.card` (no outer border).
   - **Text Fields / Inputs**: `minHeight: TOUCH_TARGET.min` (48px), `backgroundColor: Colors.surface.screen`, `borderWidth: 1`, `borderColor: Colors.borderInput`, `borderRadius: RADIUS.sm`, `color: Colors.textScale.primary`.

5. **Dynamic Header Elevation & Scroll Shadows**:
   - **Unscrolled State (`offsetY <= 0`)**: In-screen navigation headers blend seamlessly into the screen background (`backgroundColor: Colors.surface.screen`) with zero borders and zero drop shadows.
   - **Scrolled State (`offsetY > 0`)**: As content scrolls underneath the fixed header, a dynamic 12px directional gradient shadow (`colors: ["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.05)", "transparent"]`) appears immediately below the header (`zIndex: 9`, `pointerEvents: "none"`), establishing natural visual depth across `SelectTimerScreen`, `AwardsScreen`, and `CreateTimerScreen`.
   - **Dynamic Type & Accessibility**: Containers containing text must use `minHeight` rather than rigid fixed `height` to allow natural flex expansion without clipping when users increase device text size.
   - **Scrollable Insets & Floating Actions**: Scrollable lists and views with fixed/docked bottom action bars (e.g., `CompletionScreen`, `CreateTimerScreen`) must float docked actions with `paddingHorizontal: Spacing.screen` (16px) and safe-area bottom insets, while providing a dynamic scroll bottom padding cushion equal to the action bar's measured height so all content remains fully viewable.

6. **Bottom Sheets & Modals Standard**:
   - **Backdrop**: Translucent darkened overlay (`Colors.surface.overlay`) with animated opacity fade-in.
   - **Sheet Transitions**: Slide-up transition (`animationType="slide"`).
   - **Top Corners**: Rounded top corners (`borderTopLeftRadius: RADIUS.lg`, `borderTopRightRadius: RADIUS.lg`).
   - **Dismissal**: Top-right "Done" / close button and tapping the backdrop dismisses the sheet.

7. **Standardized Loading Indicator System**:
   - **Full Viewport Replacement**: Centered loading indicator (`ActivityIndicator size="large" color={Colors.primary}`).
   - **Minimum Display Duration**: 1500 ms floor to eliminate screen micro-flicker and provide stable visual feedback.
