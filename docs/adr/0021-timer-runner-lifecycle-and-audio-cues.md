# 21. Timer Runner Lifecycle and Audio Cues

We decided to use mutable sequence refs in the timer runner to guarantee seamless multi-round interval progression, and established sound design cues using `assets/sounds/beep.mp3`.

1. **Timer Progression Guarantees**:
   - `flatIntervalsRef` stores the complete multi-round flattened interval list in [TimerScreen.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/screens/TimerScreen.tsx), preventing closure state desynchronization in `setInterval`.
   - The runner reliably advances through every interval across all rounds (`timer.rounds * timer.intervals.length`) before completing the workout.

2. **Interval Audio Cue**:
   - Single `beep.mp3` sound plays on initial countdown start, on every interval transition, and when unpausing/resuming playback.

3. **Celebration Fanfare**:
   - When the final interval finishes and [CompletionScreen.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/screens/CompletionScreen.tsx) opens, an 8-beep fanfare plays automatically using a 4-instance sound pool to prevent seek/buffer dropouts:
     - Burst 1: 4 rapid beeps at an 80ms tempo.
     - Inter-burst pause: 300ms delay.
     - Burst 2: 4 rapid beeps at an 80ms tempo.
   - All audio resources are cleaned up safely on screen unmount.
