# 2. Share Timers via Deep Links

We decided to share timers by encoding the timer data inside a custom deep-link URI (e.g. `interval://import?data=<encoded_json>`) sent via SMS. This supports offline, local-first storage without requiring a centralized backend server, allowing users to import shared timers with a single tap.
