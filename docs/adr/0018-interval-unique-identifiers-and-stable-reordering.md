# 18. Interval Unique Identifiers and Stable Reordering

We decided to add first-class persistent unique identifiers (`id: string`) to the `Interval` domain model and use them for all list key extraction, selection state tracking, and drag-and-drop operations.

1. **Persistent Interval Identity**:
   - `Interval` objects now include a required `id: string`, generated upon interval creation, workout generation, or boundary normalization.
   - Backward compatibility is maintained via `normalizeInterval`, which assigns deterministic fallback IDs to legacy timers loaded from `AsyncStorage` or external routes without IDs.

2. **Stable List Keying & Reordering**:
   - `DraggableFlatList` in `CreateTimerScreen` extracts keys using `item.id` rather than array indexes (`interval_${index}`). This resolves visual flickering, animation snapping, and misplaced item drops caused by key desynchronization during gesture interactions.

3. **Identity-Based Active Selection**:
   - The interval editor in the bottom carousel now tracks active focus using `selectedIntervalId: string` instead of array index arithmetic. Reordering intervals no longer risks desynchronizing or misaligning the open editor card.

4. **Tactile Haptic Feedback**:
   - Integrated light haptic feedback via `expo-haptics` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`) when engaging drag handles and beginning drag operations.
