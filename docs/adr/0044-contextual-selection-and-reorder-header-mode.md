# ADR 0044: Contextual Selection and Reorder Header Mode

## Status
Accepted

## Context
Previously on `SelectTimerScreen`, every timer card featured a static left drag handle icon (`drag-indicator`). This added visual clutter to otherwise clean borderless cards and constrained horizontal metadata room.

Users need an uncluttered card layout that supports reordering, single/batch deletion, and sharing through an intuitive touch gesture without permanent inline handles.

## Decision
1. **Clean Borderless Timer Cards**:
   - Removed the permanent `drag-indicator` handle and inline share button from default timer card rendering.
   - Preserved quick Play CTA button on cards when not in selection mode.
   - Restored uniform horizontal card padding (`padding: Spacing.md`).

2. **Long-Press Activation**:
   - Long-pressing (`onLongPress`, 250ms hold) on any timer card triggers a medium haptic pulse and enters **Contextual Selection Mode**, marking that timer as selected.
   - While in selection mode, tapping cards toggles selection, displaying an explicit checkmark/radio indicator.

3. **Dynamic Contextual Header**:
   - The top header morphs from the greeting bar into a Contextual Action Bar:
     - **Close Button (Left)**: Clears selection and exits mode.
     - **Selection Counter (Center)**: Displays selected count (`%{count} Selected`).
     - **Share Icon Button (Right)**: Directly shares the selected timer when 1 timer is selected.
     - **Rearrange Icon Button (Right)**: Enters dedicated drag-and-drop reorder mode, automatically clearing active selection borders, revealing drag handles, and providing a "Done" button to complete list reorganization.
     - **Delete Icon Button (Right)**: Triggers confirmation alert to batch-delete selected timers.

4. **Border Artifact Prevention & Decoupled Selection Overlay**:
   - Clears selection states (`selectedTimerIds`) immediately upon entering or exiting reorder mode so rearranged cards return cleanly to borderless card surfaces without persistent borders.
   - Decoupled selection borders from the outer card container: `styles.card` remains 100% borderless (`borderWidth: 0`), while selection highlighting is rendered via an internal absolute overlay (`cardSelectedBorder`, `...StyleSheet.absoluteFillObject`, `borderRadius: RADIUS.md`, `borderWidth: 2`, `borderColor: Colors.primary`, `pointerEvents: "none"`). This prevents React Native CoreAnimation/Elevation from resetting the outer shadow path to a sharp 0px rectangle upon deselection.
   - Removed single-sided border color properties (`borderLeftColor`) on draggable items in `CreateTimerScreen.tsx` in favor of dedicated color indicator dots (`intervalColorDot`).

## Consequences
- Timer cards are clean, modern, and uncluttered during everyday workout browsing.
- Powerful list management (reordering, sharing, deletion) is accessible on demand via standard mobile hold gestures.
