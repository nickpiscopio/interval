# 54. Native Voice Control Hot Phrases

We decided to add opt-in, hands-free **Voice Control** for Play/Resume and Pause commands on [TimerScreen.tsx](../../src/screens/TimerScreen.tsx) using native speech recognition via `expo-speech-recognition`, preferring on-device processing whenever supported and falling back to standard OS speech recognition otherwise.

## Key Decisions

1. **Opt-In Activation, Availability & Versioned Onboarding**:
   - **Voice Control** defaults to OFF so users are never unexpectedly prompted for microphone permissions when starting a **Timer**.
   - An upper-right microphone toggle in the active Timer runner header exposes ON/OFF state with a clear active-listening indicator, and hides itself silently when `isRecognitionAvailable()` is `false` (or the native module is unavailable).
   - When `supportsOnDeviceRecognition()` is `true`, recognition requests `requiresOnDeviceRecognition: true`; otherwise it falls back to standard OS speech recognition so simulators, older Android versions, web browsers with Web Speech API, and devices without downloaded offline models remain supported.
   - The first time a user toggles **Voice Control** ON (or after a future release bumps the stored explainer version constant), the Timer pauses and presents `CustomAlertModal` explaining what **Voice Control** does and listing the localized hot phrases. OS microphone and speech recognition permissions are requested only after the user explicitly confirms; canceling restores the prior play/pause state.
   - Toggling OFF stops recognition immediately with no confirmation dialog. Both the enabled preference and acknowledged explainer version persist in `AsyncStorage`. If OS permissions are denied, the toggle remains OFF and an alert offers an "Open Settings" shortcut.

2. **Strict Multi-Word Localized Hot Phrases**:
   - Transcripts are matched case-insensitively with normalized whitespace and full phrase boundaries against localized multi-word commands across English (`en`), Spanish (`es`), and French (`fr`), with English phrases always accepted as fallback:
     - **Play / Resume**: `"Play timer"`, `"Play workout"`, `"Resume timer"`, `"Resume workout"` (and localized equivalents)
     - **Pause**: `"Pause timer"`, `"Pause workout"` (and localized equivalents)
   - Isolated single words (such as `"play"`, `"pause"`, `"start"`, or `"stop"`) are ignored to avoid accidental triggers from music, background conversation, or workout breathing.
   - State transitions are idempotent (Play/Resume only resumes when paused; Pause only pauses when running) and debounced by a ~500ms cooldown to prevent double-toggles from streaming partial results.

3. **Session Lifecycle & Recovery**:
   - Recognition remains active while the Timer is paused so a Play/Resume phrase can resume the workout hands-free.
   - Recognition stops immediately while alert dialogs are open, when `AppState` moves to background/inactive, or on unmount/completion, and resumes automatically when returning to the active foreground if the toggle is ON.
   - When the OS ends a continuous recognition session after prolonged silence or duration limits (e.g., iOS ~60s timeout), recognition automatically restarts while the toggle is ON and the screen is active.
   - In fallback mode (non-on-device), transient `"network"` errors clear the active listening indicator (`isListening = false`) silently without interrupting the active Timer or clearing the user's `isEnabled` preference, so recognition retries automatically on the next foreground or session.

## Considered Options

- **`expo-speech-recognition` preferring on-device with standard OS fallback (chosen)**: Uses native iOS, Android, and Web speech recognition APIs with zero external accounts or API keys, offline support wherever the device supports on-device models, and broad compatibility on devices/simulators without offline packs.
- **Strict on-device recognition only**: Rejected because `supportsOnDeviceRecognition()` returns `false` on iOS Simulators, Web, Android < 12, and many real devices without downloaded offline speech models, silently hiding the feature.
- **Cloud speech-to-text APIs**: Rejected due to third-party accounts, audio privacy concerns, and ongoing API costs.
- **Third-party wake-word SDKs (e.g., Picovoice Porcupine)**: Rejected due to external account/API-key dependencies, licensing constraints, and per-locale custom model maintenance.
- **Single-word voice commands**: Rejected due to high false-trigger risk during real workouts.

## Consequences

- Introduces a native module and Expo config plugin (`expo-speech-recognition`) with iOS `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` declarations (Android already declares `RECORD_AUDIO`), requiring a native dev-client/prebuild rebuild rather than Expo Go.
- Unsupported devices hide the microphone toggle cleanly with no impact on core Timer execution.
- Bumping the explainer version constant in future releases automatically re-displays the onboarding summary once whenever supported hot phrases change.
