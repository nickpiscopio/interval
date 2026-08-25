# 22. Millisecond-Precision Background Progress Animation

We decided to drive the background countdown progress bar via continuous 60fps linear animation over the exact interval duration in milliseconds, while decoupling the main countdown text to render clean integer seconds.

1. **Continuous Linear Progress Animation**:
   - `progressAnim` (`Animated.Value`) drives the background fill height from 100% to 0% linearly using `Animated.timing` with `Easing.linear` over the exact milliseconds of each interval.
   - Eliminates stepped 100ms visual chunks, producing a smooth liquid drain animation.
   - Handles pause/resume by capturing fractional progress and restarting animation from remaining milliseconds.

2. **Decoupled Whole-Second Display**:
   - Primary countdown text updates only when integer seconds change, reducing unnecessary React re-renders while delivering 60fps visual background animation.
