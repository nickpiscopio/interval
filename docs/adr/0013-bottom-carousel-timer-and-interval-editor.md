# 13. Bottom Carousel Timer and Interval Editor

We decided to relocate the "Timer Details" configuration into a swipeable bottom carousel panel alongside the "Edit Selected Interval" card rather than stacking them vertically in the primary scroll view.

1. **Focused Viewport Model**: Only one editor context is visible at a time at the bottom of the screen—either global Timer Details (Card 1) or the active Interval Editor (Card 2)—maximizing vertical screen real estate for the interval sequence list.
2. **Carousel Interaction**: The bottom panel supports horizontal swipe paging between the two cards, accompanied by pagination dot indicators.
3. **Contextual Auto-Navigation**: Selecting or adding an interval in the main list automatically animates the bottom carousel to the Interval Editor (Card 2). Swiping back allows editing timer-level properties and executing timer lifecycle actions.
4. **Encapsulated Timer Actions**: Timer-level actions (Start, Save/Import, and Delete Timer) are housed strictly within the Timer Details card, requiring a valid timer name before starting or saving.
