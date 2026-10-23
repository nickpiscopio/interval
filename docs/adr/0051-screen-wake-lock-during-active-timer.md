# 51. Screen Wake Lock During Active Timer

We decided to integrate `expo-keep-awake` using programmatic lifecycle activation (`activateKeepAwakeAsync` and `deactivateKeepAwake` with tag `'timer-running'`) during active timer execution, automatically acquiring the wake lock when the countdown runs or resumes and releasing it upon pause, exit confirmation, completion, or screen unmount.

1. **Uninterrupted Workout Progression**:
   - Mobile operating systems throttle background JavaScript intervals or turn off screens after inactivity timeouts, which would freeze active interval timers and suppress vital audio cues.
   - Keeping the display awake ensures visual countdown awareness and guaranteed timer execution without requiring the user to tap the screen during workouts.

2. **Battery Conservation on Pause & Exit**:
   - While the static `useKeepAwake()` hook keeps the screen illuminated throughout the entire component mount, programmatic control (`activateKeepAwakeAsync` / `deactivateKeepAwake`) releases the lock when the user explicitly pauses the timer, hits exit confirmation, or finishes the workout.
   - This prevents unintended battery drain if a user steps away or pauses a routine without closing the app.

3. **Zero-Configuration UX**:
   - The wake lock engages automatically during active timers without requiring an extra configuration toggle or settings menu friction, maintaining hands-free usability out of the box.
