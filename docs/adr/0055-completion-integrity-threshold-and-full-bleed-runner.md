# 55. Completion Integrity Threshold and Full-Bleed Runner Background

Amends [ADR-0052 (Interactive Interval Timeline in Timer Runner)](./0052-interactive-interval-timeline.md).

We decided to amend two aspects of the active Timer runner introduced in ADR-0052: (1) replacing unconditional full-**Total Time** completion credit with an 85% per-**Interval** active **Completion Integrity Threshold**, and (2) moving the animated liquid-drain progress overlay from the upper hero container to the root container of [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) for full-bleed edge-to-edge coverage in both portrait and landscape orientations.

## Key Decisions

1. **85% Per-Interval Completion Integrity Threshold** (amends ADR-0052 §3 "Completion & Badge Accounting"):
   - Because the interactive **Interval Timeline** lets users tap any row to jump ahead, unconditionally awarding full **Total Time**, streaks, and badges allowed skipping straight to the final Interval to game achievements.
   - [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) tracks active unpaused elapsed milliseconds per flattened Interval instance, capping each bucket at that Interval's own configured duration (`duration * 1000`) so repeatedly replaying a single Interval cannot compensate for skipping the rest of the **Timer**.
   - When the final Interval finishes, [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) passes `{ timer, performedSeconds, completedIntervals, qualifiesForCredit }` to [CompletionScreen.tsx](../../src/screens/CompletionScreen.tsx), where `qualifiesForCredit` requires at least 85% of the Timer's configured **Total Time** (`totalCreditedMs / (totalTimeSeconds * 1000) >= 0.85`).
   - [CompletionScreen.tsx](../../src/screens/CompletionScreen.tsx) always displays the user's actual `performedSeconds` and `completedIntervals` and plays the normal **Workout Completion Audio** without any scolding or disqualifying banner. When `qualifiesForCredit` is true, it calls `recordWorkoutCompletion(timer, performedSeconds)` and surfaces any newly unlocked badges; when false, it skips recording and reads unmodified `getUserStats()` so existing streaks render accurately without inflating stats or unlocking achievements.

2. **Full-Bleed Root-Level Progress Background** (amends ADR-0052 §1 "Layout & Progress Bar Isolation"):
   - Moves the animated liquid-drain `timerBar` overlay from the upper hero region to the root container of [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) (`position: "absolute"`, full width, bottom-anchored, height `0%`–`100%`) so both the active Interval color and the draining progress span edge-to-edge from the top to the bottom of the screen behind the translucent **Interval Timeline** (ignoring system safe-area insets).
   - Provides visual continuity in both portrait (vertical stack) and landscape (55% hero / 45% full-height timeline split), while foreground header controls, countdown typography, and timeline rows continue respecting safe-area insets.

## Considered Options

- **85% per-interval capped threshold with silent non-credit (chosen)**: Prevents skip-gaming and single-interval replay farming while still crediting genuine workouts where a user skips a brief warm-up or final few seconds, without showing punitive UI.
- **100% strict completion or disabling forward jumps**: Rejected because it undermines the random-access utility of the **Interval Timeline** and penalizes minor workout adjustments.
- **Displaying a warning or "disqualified" banner below 85%**: Rejected to keep the completion experience calm and non-judgmental for users intentionally previewing or running partial routines.
- **Keeping the progress bar confined to the upper hero region**: Rejected because it created a hard visual cutoff above the timeline in portrait and left the right-hand timeline pane disconnected from the progress drain in landscape.

## Consequences

- `Completion` navigation params gain optional `performedSeconds`, `completedIntervals`, and `qualifiesForCredit` fields with backward-compatible defaults when omitted.
- Skipping most of a Timer still lands cleanly on [CompletionScreen.tsx](../../src/screens/CompletionScreen.tsx) with accurate performed time and interval count, without inflating Total Time, streaks, or badges.
- The translucent **Interval Timeline** surface remains legible over the full-bleed animated drain across all **Approved Interval Color Palette** colors in both portrait and landscape modes.
