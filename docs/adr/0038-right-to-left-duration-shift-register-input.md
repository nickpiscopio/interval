# ADR 0038: Right-to-Left Duration Shift-Register Input

## Status
Accepted

## Context
When entering interval durations in `CreateTimerScreen`, the duration textfield previously attempted to convert the duration to total seconds and back to a formatted string on every single keystroke. This caused the input value to collapse or block after entering a single digit, preventing multi-digit entries like `30s`, `1m 30s`, or `12m 00s`.

## Decision
1. **Right-to-Left 6-Digit Shift Register**:
   - The duration textfield uses a right-to-left numeric queue (ATM/timer keypad style) up to 6 digits (`HHMMSS`).
   - Digits are padded with leading zeroes and rendered as `HH:MM:SS` (e.g., `3` ➔ `00:00:03`, `30` ➔ `00:00:30`, `130` ➔ `00:01:30`, `1300` ➔ `00:13:00`).
   - Backspace drops the rightmost digit and shifts existing digits to the right.
2. **Keystroke Calculation & Blur Normalization**:
   - While editing, the raw digit sequence is preserved to prevent keystroke collisions. Total duration in seconds is computed as `(hours * 3600) + (minutes * 60) + seconds` and assigned to `interval.duration`.
   - On blur or interval switch, durations < 1s default to 1s (`00:00:01`), and formatted strings are normalized to canonical `HH:MM:SS`.
3. **Reactive Interval Synchronization**:
   - Switching selected intervals, duplicating an interval, or adding a new interval synchronizes the local duration string buffer to the target interval's formatted duration.
4. **Automated Verification**:
   - Comprehensive unit and interaction tests in `CreateTimerScreen.test.tsx` verifying multi-digit entry, backspacing, bounds checking, and minimum duration enforcement.

## Consequences
- Fluid, standard timer input UX allowing fast entry of seconds, minutes, and hours.
- Prevents premature conversions and single-digit entry lockout.
