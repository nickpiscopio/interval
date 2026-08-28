# ADR 0040: Dedicated Bottom Sheet for Interval Editing

## Status
Accepted (Supercedes ADR 0019, ADR 0020, ADR 0039 horizontal carousel design)

## Context
Previously, `CreateTimerScreen` used a 2-card horizontal carousel at the bottom of the screen to toggle between "Timer Details" and "Edit Interval". When the software keyboard appeared to edit text fields, conflicting horizontal scroll gestures, `KeyboardAvoidingView` calculations, and layout shifts degraded the user experience and obscured text inputs.

## Decision
1. **Docked Timer Details Card on Main Screen**:
   - The main `CreateTimerScreen` contains the interval list in the upper viewport and a single, clean docked "Timer Details" card at the bottom (Timer Name, Rounds, Delete, Save, Start).
   - Removed horizontal carousel, footer pagination dots, and "Timer Details" / "Edit Interval" bottom navigation links.
2. **Dedicated Slide-Up Bottom Sheet Modal for Interval Editing**:
   - Tapping an interval in the list or tapping "+ Add Interval" immediately opens a dedicated slide-up bottom sheet modal (`EditIntervalModal`).
   - The modal features a header with "Edit Interval" title and a top-right **"Done"** button, interval name input (with Library picker), 6-digit right-to-left duration shift register, color palette, and Delete/Duplicate actions.
   - Built-in `KeyboardAvoidingView` inside the modal guarantees all text fields and action buttons remain 100% visible and un-obscured above the software keyboard.

## Consequences
- Eliminates keyboard fighting and layout shifts completely.
- Greatly simplifies navigation and visual hierarchy.
- Provides a focused, ergonomic editing experience with touch persistence and instant dismissal.
