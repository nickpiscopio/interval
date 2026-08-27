# ADR 0031: Preserve AI-Generated Tag Across Timer Lifecycle

## Status
Accepted

## Context
When a user generated a custom HIIT workout with the AI coach, `generateWorkout` properly tagged the timer with `isAiGenerated: true`. However, when previewed in `CreateTimerScreen` and saved to `AsyncStorage`, the `isAiGenerated` field was omitted from `timerToSave`, causing the emerald `✨ AI` badge pill in `SelectTimerScreen` to disappear. The flag was also omitted in deep-link share payloads.

## Decision
1. **CreateTimerScreen State Persistence**:
   - Initialized `isAiGenerated` state in `CreateTimerScreen.tsx` derived from `editTimer?.isAiGenerated ?? Boolean(editTimer?.id?.startsWith("ai_"))`.
   - Propagated `isAiGenerated: isAiGenerated ? true : undefined` into `timerToSave` in `saveTimer()` and into `timer` route params in `startTimer()`.

2. **Sharing & Deep Links**:
   - Updated `handleShareTimer` in `SelectTimerScreen.tsx` and `handleShare` in `CompletionScreen.tsx` to include `isAiGenerated: timer.isAiGenerated` within the encoded share payload.

3. **UI Consistency**:
   - The emerald `✨ AI` badge pill now reliably displays on workout cards in `SelectTimerScreen` for all seeded default AI workouts and user-generated AI routines.

## Consequences
- **Positive**: Seamless brand recognition for AI-assisted routines across the app.
- **Positive**: Clean round-trip persistence through editing, saving, running, and sharing.
