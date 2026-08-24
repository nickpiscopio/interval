# 17. Drag and Drop Reordering for Timers and Intervals

We decided to support vertical drag-and-drop reordering for saved Timers on the Select Timer screen and Intervals within the Create/Edit Timer screen.

1. **6-Dot Drag Handle**:
   - Placed a 6-dot matrix drag handle (`MaterialIcons: drag-indicator`) on the far left of each Timer card and Interval sequence item.
2. **Visual Feedback**:
   - Items in an active drag state exhibit elevated z-index, enhanced drop shadow, and subtle brand border tint (`#1A6CCC`).
3. **Instant Persistence**:
   - Timer reorders on `SelectTimerScreen` persist immediately to local `AsyncStorage`.
   - Interval reorders on `CreateTimerScreen` dynamically update the sequence and retain the user's active interval focus.
