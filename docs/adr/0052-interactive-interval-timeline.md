# 52. Interactive Interval Timeline in Timer Runner

Amends [ADR-0024 (Clean Hero Timer Layout Without Video)](./0024-clean-hero-timer-layout-without-video.md).

We decided to replace the centered `NEXT UP` preview card on [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) with a docked, scrollable **Interval Timeline** showing every flattened **Interval** across all **Rounds**, allowing users to tap any past, active, or upcoming Interval to redo, restart, or skip directly to it.

## Key Decisions

1. **Layout & Progress Bar Isolation**:
   - The top header and centered hero (active Interval name + large countdown) remain in the upper region, with Round/Interval metadata on the left and the Play/Pause button on the right directly above the timeline divider.
   - The 60fps millisecond background drain bar is confined to the upper timer region so the docked **Interval Timeline** rests on a steady translucent surface with safe-area bottom padding and consistently legible rows.
   - Each row displays the Interval name and duration (`{duration}s`, without a sequence number), with dimmed past rows, a light rounded highlight pill on the active row, and crisp white upcoming rows. The timeline renders even for single-Interval Timers so tap-to-restart stays consistent.

2. **Jump Lifecycle & Auto-Scroll**:
   - Single-tapping any row jumps immediately with no confirmation modal and preserves the current play/pause state: if running, the selected Interval resets to full duration (100% progress bar), starts counting down, and plays its **Interval Sound**; if paused, it resets to full duration and stays silent/paused until resumed.
   - The timeline smoothly auto-scrolls on active Interval changes to keep one completed Interval visible above the active row and upcoming Intervals below, while yielding to manual user scrolling.

3. **Considered Options & Boundaries**:
   - **Prev/Next skip buttons** were rejected in favor of direct random-access selection via the scrollable list, avoiding clutter next to Play/Pause.
   - **Completion & Badge Accounting**: Jumping backward or forward does not alter [CompletionScreen.tsx](../../src/screens/CompletionScreen.tsx) or [badgeService.ts](../../src/services/badgeService.ts); stats remain based on the Timer's configured **Total Time**.

