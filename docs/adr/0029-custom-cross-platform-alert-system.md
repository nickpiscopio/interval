# ADR 0029: Custom Cross-Platform Alert System (Android & iOS)

## Status
Accepted

## Context
Standard React Native `Alert.alert(...)` renders native platform dialogs that look completely different between Android (Material) and iOS (Cupertino), cannot be styled with the application's design system tokens, lack brand typography (`Poppins`), and do not support contextual iconography or custom haptic micro-interactions. A unified, cross-platform custom alert system was required so all alerts appear identical with consistent branding across both operating systems.

## Decision
1. **Global Alert Context (`AlertProvider` & `useAlert()`)**:
   - Created `src/context/AlertContext.tsx` providing a global `showAlert(options: AlertOptions)` and `hideAlert()` hook.
   - Wrapped the root of the application (`App.tsx`) with `<AlertProvider>` above the navigation container.

2. **Custom Alert Modal Component (`src/components/CustomAlertModal.tsx`)**:
   - **Contextual Icon Badges**: Displays a top circular icon bubble matching the alert context:
     - `trash` / `warning` (Amber/Red) for destructive actions (e.g. Delete Timer, Exit Workout).
     - `error` (Red) for input/interval validation failures.
     - `info` / `help` (Blue) for guidance and tips.
     - `success` (Emerald) for confirmations.
   - **Unified Typography & Design System**: Rendered with `Poppins-Bold` titles and `Poppins-Regular` messages using `Spacing` and `FontSize` tokens.
   - **Adaptive Button Layout**:
     - 1 button (Info / Error): Single full-width primary button.
     - 2 buttons (Confirmation / Destructive): Side-by-side row with `Cancel` (soft gray) on the left and `Destructive` (vibrant red `#EF4444`) on the right.
   - **Physics & Motion**: Smooth spring scale (`0.85` -> `1.0`) and fade (`0` -> `1.0`) entrance with medium haptic pulse (`Haptics.impactAsync`).
   - **Dismissal**: Tapping backdrop dismisses the dialog safely by triggering the cancel callback if present.

3. **Complete Migration**:
   - Replaced all legacy `Alert.alert` calls across `CreateTimerScreen.tsx` and `TimerScreen.tsx` with `showAlert(...)`.
   - All alert titles, messages, and button labels are localized via `t(...)` in English, Spanish, and French.

## Consequences
- **Positive**: Consistent, polished, premium UI across both Android and iOS that matches the app's visual language.
- **Positive**: Simple, declarative hook API (`const { showAlert } = useAlert()`) accessible from any screen.
- **Positive**: Accessible touch targets (minimum 44pt height) and tactile haptic feedback.
