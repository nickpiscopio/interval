# 23. Exercise Video Catalog and Playback Lifecycle

We decided to update all exercise demonstration videos to high-availability HTTPS MP4 streams and implement intelligent fallback name matching for interval video resolution.

1. **High-Availability Video Streams**:
   - Replaced broken Google sample storage bucket URLs with verified, public HTTPS MP4 streams supporting byte-range requests in [exerciseCatalog.ts](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/constants/exerciseCatalog.ts).

2. **Intelligent Exercise Resolution**:
   - In [TimerScreen.tsx](file:///Users/nickpiscopio/Documents/workarea/nick/interval/src/screens/TimerScreen.tsx), interval exercises are resolved by `exerciseId` first, falling back to case-insensitive and fuzzy name matching against `EXERCISE_CATALOG`.
   - "Rest" intervals cleanly render the resting placeholder animation.

3. **Video Player Lifecycle**:
   - `useVideoPlayer` initializes with the resolved video URL or null, and automatically synchronizes looping playback on interval changes and play/pause toggles.
