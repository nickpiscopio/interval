# ADR 0041: Translucent Floating Tab Bar and Stacked Floating Action Buttons

## Status
Accepted (Amends ADR 0015, ADR 0016 bottom dock patterns)

## Context
Previously, `SelectTimerScreen` used an anchored, full-width solid bottom dock tab bar combined with a separate full-width button panel above it for "Create Custom" and "Generate with AI". This stacked layout crowded the bottom viewport, consumed valuable screen real estate, and obscured workout list items.

## Decision
1. **Translucent Floating Navigation Bar**:
   - Replaced the solid anchored bottom dock with an icon-only floating navigation bar spanning across the bottom with horizontal margins (`left: Spacing.screen`, `right: Spacing.screen`, `bottom: Math.max(insets.bottom, 12)`).
   - Designed with rounded pill geometry (`borderRadius: RADIUS.full`), translucent background (`rgba(255, 255, 255, 0.88)`), border (`#E5E7EB`), and soft elevation drop shadow.
   - **Icon-Only Tabs**:
     - Workouts tab: `timer` / `timer-outline`.
     - Exercise Library tab: `barbell` / `barbell-outline`.
   - **Active State Highlighting**: The active tab receives an inner tinted blue pill background (`#EFF6FF`) with filled brand icon (`Colors.primary`), while inactive tabs use outline icons (`#6B7280`) on transparent backgrounds.

2. **Stacked Floating Action Buttons (FABs)**:
   - Positioned floating action buttons on the bottom right above the floating tab bar, exclusive to the Workouts tab.
   - **Generate with AI (Bottom-Right Hero FAB)**:
     - `56x56` circular button (`borderRadius: 28`) constructed with an outer elevation shadow container and an inner full-bleed touchable (`overflow: "hidden"`) containing the AI linear gradient (`["#1A6CCC", "#1ACC6C"]`), white `sparkles` icon (24px), and emerald drop shadow (`#059669`). This guarantees that the press feedback layer expands to the exact 56x56 circular boundary without clipping or size mismatch.
   - **Create Custom (Stacked Above)**:
     - `44x44` circular button (`borderRadius: 22`) styled with solid brand blue (`#1A6CCC`), white `add` (`+`) icon (24px), and elevated shadow.

3. **Content Scroll Insets**:
   - Adjusted content padding on `DraggableFlatList` and `ExerciseLibraryView` so all list items and cards scroll freely into full view above the floating tab bar and FABs.

## Consequences
- Creates a modern, lightweight, and spacious viewport that does not feel crowded.
- Establishes a strong visual hierarchy where AI generation and manual timer creation are easily accessible via dedicated FABs without competing for horizontal space.
- Retains effortless one-tap switching between Workouts and the Exercise Library.
