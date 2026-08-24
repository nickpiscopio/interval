# 14. Icon-Only Action Buttons and RTL Time Entry

We decided to refine the bottom carousel panel in `CreateTimerScreen` with safe-area spacing, streamlined icon-only actions, a dedicated "Done" navigation trigger, and right-to-left `HH:MM:SS` duration entry.

1. **Safe Area Integration**: Applied safe area insets to bottom padding, elevating pagination indicators and cards above device home indicators.
2. **"Done" Contextual Return**: Added a top-right "Done" button on the "Edit Selected Interval" card to smoothly transition back to "Timer Details".
3. **Icon-Only Action Buttons**: Replaced text labels with minimalist icon-only buttons across both cards:
   - Timer Actions: Delete (red trash), Save/Import (neutral bookmark/download), and Start (Interval primary blue `#1A6CCC` play icon).
   - Interval Actions: Delete (red trash) and Duplicate (neutral copy).
4. **Positional Right-to-Left `HH:MM:SS` Time Entry**: Replaced increment/decrement steppers with a direct number-pad input where digits push in right-to-left into fixed `HH:MM:SS` slots with a 1-second floor.
