# 24. Clean Hero Timer Layout Without Video

We decided to remove video playback functionality and establish a bold, centered hero workout display on [TimerScreen.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/screens/TimerScreen.tsx).

1. **Removal of Video Playback**:
   - Removed `expo-video` dependencies, video players, and media cards from `TimerScreen.tsx`.
   - Made `videoUrl` optional in [Exercise.ts](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/model/Exercise.ts) and cleaned up exercise catalog definitions.

2. **Centered Hero Display**:
   - The interval name, large high-contrast countdown number (96px), round metadata, and NEXT UP preview card are vertically centered on the screen.
   - The fluid 60fps millisecond background progress fill provides clear, distraction-free visual feedback across the entire viewport.
