# ADR 0039: Keyboard-Aware Docked Editor Panel & Touch Persistence

## Status
Accepted

## Context
In `CreateTimerScreen`, when focusing text fields (e.g. Timer Name or Interval Duration), software keyboard appearance previously caused the bottom docked cards to shift downward or intercept button taps for keyboard dismissal. This made tapping "Create Timer", "Edit Interval", or action buttons require multiple taps or miss touch targets.

## Decision
1. **Touch Persistence (`keyboardShouldPersistTaps="handled"`)**:
   - Enable `keyboardShouldPersistTaps="handled"` on `DraggableFlatList`, `carouselScrollView`, and internal scroll views so all buttons and navigation tabs receive taps directly on the first touch while the keyboard is open.
2. **Keyboard-Aware Inset Adjustment**:
   - Listen to `keyboardDidShow` / `keyboardDidHide` events.
   - When the keyboard is active, zero out the home indicator bottom inset (`bottomInset = 0` or `Spacing.xs`) since the software keyboard displaces the home indicator.
   - When the keyboard hides, restore standard safe-area bottom inset.
3. **Fixed Bottom-Anchored Positioning**:
   - Prevent downward shifting during active editing by keeping card carousel and navigation heights fixed and anchored.

## Consequences
- Eliminates layout shifting and jumpy animations during text field editing.
- Ensures all navigation and action buttons respond instantly on first touch.
