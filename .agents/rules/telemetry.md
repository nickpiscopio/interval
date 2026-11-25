# Telemetry & Observability Rule (Firebase Analytics & Crashlytics)

Whenever designing, implementing, or modifying a user-facing feature, screen, modal, or native integration in this repository, you MUST proactively consider telemetry and observability:

1. **Proactively Ask About Coverage**:
   - Before finalizing a plan or spec for a new feature or user-facing flow, ask the user whether the feature needs new **Firebase Analytics** events or **Firebase Crashlytics** non-fatal error coverage.

2. **Centralized Service Wrappers Only**:
   - NEVER import `@react-native-firebase/*` directly in screens, components, hooks, or domain services.
   - Always route Analytics through `src/services/analyticsService.ts` (`logEvent`, `logScreenView`) and Crashlytics through `src/services/crashlyticsService.ts` (`recordNonFatalError`, `logBreadcrumb`, `setTelemetryAttribute`).

3. **Strict Zero-PII & Anonymous-Only Hygiene**:
   - NEVER transmit free-text user input—specifically custom Timer names, Interval names, or any personal identifiers—in Analytics parameters, Crashlytics breadcrumbs, or Crashlytics attributes.
   - Only normalized IDs, enums, booleans, and numeric counts/durations are permitted.

4. **GA4 Event Naming & Lean Payloads**:
   - Event names and parameter keys MUST use GA4-compliant `snake_case` (<= 40 characters) and be registered in `AnalyticsEventMap` in `src/services/analyticsService.ts`.
   - Share events MUST only fire when the native share sheet completes with `Share.sharedAction`, never when dismissed.

5. **Filtered Non-Fatal Crashlytics Reporting**:
   - Record non-fatal errors only for genuine unexpected failures (storage corruption, audio failures, malformed deep links, resource loading failures, unexpected native module errors).
   - NEVER report expected user conditions such as speech timeouts (`no-speech`, `speech-timeout`), permission denials (`not-allowed`, `service-not-allowed`), or cancelled share sheets.

6. **Test at the Firebase SDK Seam**:
   - Do not mock `analyticsService` or `crashlyticsService` in screen/hook tests; assert observable calls against the global `@react-native-firebase/analytics` and `@react-native-firebase/crashlytics` mocks in `jest.setup.js` (with `(global as any).__DEV__ = false` in tests verifying release dispatch).
