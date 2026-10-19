# 48. Interval Sounds via a Static Sound Catalog

Each Interval can pick its own Interval Sound, which replaces the single global beep from ADR-0021. Metro bundles audio only through static `require()` calls, so the app can't list the files in `assets/sounds/` at runtime. Instead, the available sounds live in a hand-maintained catalog with stable IDs. Intervals store only the catalog ID (or "none" for silence), never a file path. A missing or unknown ID, such as one in a shared deep link from a newer or older app version, falls back to the default `beep` sound. This way shared links and saved timers never break when sounds are added or removed.

## Consequences

- Adding a sound means adding the file to `assets/sounds/` plus one catalog entry with translated display names.
- Catalog IDs are persisted and shared in links, so an ID must never be renamed or reused for a different sound.
- The completion fanfare cue from ADR-0021 is removed, because `fanfare.mp3` never shipped.
