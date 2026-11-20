# Track Timer Variety Badges by Timer ID

We track Timer Variety Badges (`variety_5`, `variety_10`, `variety_25`, `variety_50` under the new `variety` badge category) by persisting a deduplicated `completedTimerIds` set on `UserStats` rather than fingerprinting Timer contents (rounds and intervals). Tracking by `timer.id` is predictable, matches existing set-based stats like `inspectedExerciseIds`, and grants permanent lifetime credit even if a user later deletes a completed Timer.

## Considered Options

- **Track by `timer.id` (chosen)**: Simple and stable across minor edits to an existing Timer; all Timer origins (default, custom, AI-generated, imported, Quick Routine, and unsaved `temp_timer`) count. To prevent repeat runs of the same exercise's Quick Routine from inflating variety, Quick Routine IDs are changed from `quick_${Date.now()}` to deterministic `quick_${exercise.id}`. Unsaved launches retain the shared `"temp_timer"` ID so they count at most once rather than allowing repeat-run inflation.
- **Content fingerprinting**: Would treat edits to an existing Timer as a new Timer and deduplicate identical copies, but adds hashing complexity and creates surprising edge cases when users tweak rest durations or names.

## Consequences

- Existing users have no historical per-Timer completion log in `AsyncStorage`, so `completedTimerIds` starts empty and accumulates forward.
- Editing a saved Timer preserves its `timer.id` and does not grant additional variety credit.

