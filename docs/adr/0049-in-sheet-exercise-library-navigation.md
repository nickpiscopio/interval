# 49. In-Sheet Drill-Down Navigation for Interval Library Selection

When editing an interval in the Interval Edit Bottom Sheet ([EditIntervalModal.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/components/EditIntervalModal.tsx)), selecting the "Library" option transitions the internal view of the bottom sheet to the Exercise Library catalog ([ExercisePickerView.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/components/ExercisePickerView.tsx)) rather than pushing a secondary bottom sheet modal on top of the active editor sheet. This supersedes ADR-0047 §3 ("Multi-Sheet Stack Management (`stackBehavior="push"`)").

## Context & Problem

Stacking a second bottom sheet modal on top of an existing bottom sheet modal creates visual clutter, complicates hardware back navigation on Android, and degrades the user experience by layering multiple backdrops and sliding panels. A single unified bottom sheet with in-sheet view transitions provides a much cleaner, app-like navigation flow.

## Decision

1. **In-Sheet View State**: `EditIntervalModal` manages an internal `viewMode: "edit" | "library"` state. Tapping "Library" displays the catalog search and exercise list within the same sheet.
2. **Back Button Navigation**: The library view renders an icon-only back button (`arrow-back`, transparent background without a circular border/fill, strictly adhering to ADR-0016 §4) in its header that returns the user to the interval editor view without losing any in-progress changes. In in-sheet mode, the "X" close button is omitted. Tapping the back button or pressing Android hardware back returns to the editor view.
3. **Seamless Exercise Selection**: Adding an exercise from the library (via quick-add or exercise inspection) updates the interval's name, exercise ID, and color, and transitions directly back to the editor view in the same bottom sheet.
4. **Android Back Handling**: Pressing the Android hardware back button while in the library view returns to the interval editor view instead of dismissing the entire bottom sheet.
5. **Reusable View Component**: The exercise search, categories, and inspection views are encapsulated in [ExercisePickerView.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/components/ExercisePickerView.tsx), eliminating duplicated catalog logic.
6. **Dynamic Snap Points & Safe Area**: In library mode, the sheet expands to `snapPoints={["90%"]}` with direct scrollable integration (`BottomSheetFlatList`), ensuring the exercise catalog has maximum vertical space and scrolls freely without collapsing. In edit mode, the sheet uses dynamic sizing with enhanced safe-area bottom padding (`insets.bottom + Spacing.lg`), guaranteeing clearance for bottom action buttons.

## Consequences

- Stacking multiple bottom sheet modals on top of each other is avoided.
- The user maintains visual context within a single container while picking exercises for an interval.
- `ExercisePickerModal.tsx` remains as a lightweight wrapper around `ExercisePickerView` for standalone use cases and backward compatibility.
