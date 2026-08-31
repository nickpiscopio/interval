# ADR 0042: Storage-Aware Timer Persistence and Preview Lifecycle

## Status
Accepted

## Context
When a user generated a custom HIIT workout with the AI coach, `generateWorkout` produced a fully configured `Timer` object with a unique ID (e.g., `ai_172512...`) and routed to `CreateTimerScreen` in a preview state.

When saving the timer, `CreateTimerScreen.saveTimer()` previously evaluated `if (editTimer)` to determine whether to perform an in-place array `map()` update or an array `push()`. Because the AI-generated timer had not yet been committed to `AsyncStorage`, `savedTimers.map(...)` found no matching ID, causing newly generated workouts to be omitted when writing back to storage.

## Decision
1. **Storage Existence Check**:
   - Updated `saveTimer()` in `CreateTimerScreen.tsx` to search `savedTimers` by ID using `savedTimers.findIndex((t) => t.id === timerToSave.id)`.
   - If the timer ID already exists in storage (i.e. editing a saved workout), update the existing entry in place.
   - If the timer ID is not present in storage (i.e. brand-new timer, newly generated AI preview timer, or imported shared timer), append (`push`) `timerToSave` to `savedTimers`.

2. **Full Lifecycle Retention**:
   - Preserved `isAiGenerated: isAiGenerated ? true : undefined`, `createdAt`, `rounds`, `name`, and normalized interval sequences.

## Consequences
- **Positive**: Generated AI workouts and shared/imported timers reliably persist to `AsyncStorage` when the user taps save.
- **Positive**: Seamless round-trip lifecycle from generation -> preview -> storage -> dashboard.
