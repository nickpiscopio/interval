# ADR 0039: Keyboard-Aware Docked Editor Panel & Touch Persistence

## Status
Accepted

## Context
In `CreateTimerScreen`, when focusing text fields (e.g. Timer Name or Interval Duration), software keyboard appearance previously caused the bottom docked cards to shift downward or intercept button taps for keyboard dismissal. This was caused by two main factors:
1. `navigation.setOptions({ title: timerName })` executing on every keystroke, forcing React Navigation header re-renders and `KeyboardAvoidingView` recalculations while typing.
2. Inset fluctuations shrinking bottom padding when the keyboard appeared, causing the absolute container to drop downward.

## Decision
1. **Decouple Navigation Header Updates from Keystrokes**:
   - Update the navigation header title on initial screen mount and on field blur (`onBlur`), preventing layout recalculations during active typing.
2. **Constant Stable Inset**:
   - Maintain consistent bottom insets (`bottomInset = Math.max(insets.bottom, Spacing.sm)`) so the bottom container remains fixed and never drops downward.
3. **Touch Persistence (`keyboardShouldPersistTaps="handled"`)**:
   - Enable `keyboardShouldPersistTaps="handled"` across all scroll and carousel views so tapping "Timer Details", "Edit Interval", action buttons, and interval items immediately triggers on first touch.
4. **Fluid List Scrolling**:
   - The upper interval list remains fluidly scrollable above the docked card with touch persistence.

## Consequences
- Completely eliminates downward layout shifting and jumpy animations during text field editing.
- Ensures all navigation and action buttons respond instantly on first touch.
