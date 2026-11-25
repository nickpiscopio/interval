# 56. Firebase Analytics & Crashlytics Telemetry Architecture

We decided to integrate **Firebase Analytics** and **Firebase Crashlytics** behind two centralized, fail-safe TypeScript service wrappers ([analyticsService.ts](../../src/services/analyticsService.ts) and [crashlyticsService.ts](../../src/services/crashlyticsService.ts)) consuming the `@react-native-firebase` v27 modular API, paired with a root localized [ErrorBoundary.tsx](../../src/components/ErrorBoundary.tsx), runtime `__DEV__` suppression, strict zero-PII data hygiene, and reproducible iOS static-frameworks native build configuration.

## Key Decisions

1. **Centralized Fail-Safe Service Wrappers**:
   - Screens, components, hooks, and domain services must never import `@react-native-firebase/*` directly. All telemetry routes through [analyticsService.ts](../../src/services/analyticsService.ts) and [crashlyticsService.ts](../../src/services/crashlyticsService.ts).
   - Every public telemetry helper silently no-ops on Web (`Platform.OS === "web"`), suppresses native SDK dispatch in `__DEV__`, and wraps SDK calls in `try/catch` so telemetry can never crash the app or break Web previews.
   - Analytics uses a strongly typed GA4 `snake_case` event map (`AnalyticsEventMap`) covering the Timer lifecycle, Completion screen actions, and core feature adoption, plus automatic screen-view tracking wired into [src/navigation/index.tsx](../../src/navigation/index.tsx) and [src/navigation/screenTracking.ts](../../src/navigation/screenTracking.ts).

2. **Strict Zero-PII & Anonymous-Only Boundary**:
   - Telemetry is anonymous-only with no user IDs and no consent toggle UI.
   - Free-text user content—specifically custom Timer names, Interval names, and any personal identifiers—must never be passed in Analytics parameters, Crashlytics breadcrumbs, or Crashlytics attributes. Only normalized IDs, enums, booleans, and numeric counts/durations are permitted.
   - Crashlytics attributes are restricted to lightweight non-PII context (`current_screen`, `locale`, `voice_control_enabled`).

3. **`__DEV__` Suppression with Local Debug Logging**:
   - Root [firebase.json](../../firebase.json) enables release auto-collection (`crashlytics_auto_collection_enabled: true`, `analytics_auto_collection_enabled: true`) while keeping `crashlytics_debug_enabled: false`.
   - At runtime, when `__DEV__` is true, initialization explicitly disables Firebase Analytics and Crashlytics collection and all event/breadcrumb/non-fatal helpers emit lightweight `console.debug` logs instead of dispatching to Firebase so local development never pollutes production dashboards.

4. **Root ErrorBoundary & Filtered Non-Fatal Reporting**:
   - [App.tsx](../../App.tsx) wraps the root view hierarchy in a React class [ErrorBoundary.tsx](../../src/components/ErrorBoundary.tsx) that records caught render crashes (with component stack breadcrumbs) to Crashlytics and renders a design-system-compliant, localized (`en`, `es`, `fr`) recovery card with a "Try Again" action.
   - Non-fatal Crashlytics recording is scoped strictly to genuine unexpected failures (AsyncStorage read/write corruption, audio playback failures, malformed deep-link decoding, cached resource loading failures, and unexpected speech-recognition errors), explicitly excluding recoverable speech conditions (`no-speech`, `speech-timeout`), permission denials (`not-allowed`, `service-not-allowed`), and user-cancelled share sheets.

5. **iOS Static Frameworks Native Build Requirement**:
   - React Native Firebase on iOS requires static frameworks (`ios.useFrameworks: "static"`). We configure `expo-build-properties` in [app.json](../../app.json) and reflect `"ios.useFrameworks": "static"` in [ios/Podfile.properties.json](../../ios/Podfile.properties.json) so `npx expo prebuild` and `pod install` remain reproducible.

6. **Expo Go Local Development Workflow without `expo-dev-client`**:
   - Day-to-day local UI and Timer development uses **Expo Go** via `npm start` (`expo start`). `expo-dev-client` is intentionally excluded from [package.json](../../package.json) and the `development` EAS build profile is excluded from [eas.json](../../eas.json) so `expo start` launches in Expo Go by default without requiring extra flags.
   - Both [analyticsService.ts](../../src/services/analyticsService.ts) and [crashlyticsService.ts](../../src/services/crashlyticsService.ts) load `@react-native-firebase/*` through lazy `require()` calls wrapped in `try/catch` so missing native modules in Expo Go, Web, or unbuilt binaries resolve cleanly as no-ops. No other application modules may introduce eager `@react-native-firebase/*` imports.
   - Native-only capabilities (live Firebase Analytics/Crashlytics collection and Voice Control speech recognition) are verified via standard local native builds (`expo run:ios` / `expo run:android`) or EAS `preview` and `production` builds.

## Considered Options

- **Firebase JS SDK (`firebase`)**: Rejected because the Firebase JS SDK has no mobile Crashlytics module and its Analytics module is web-only (unsupported in React Native). Retaining `@react-native-firebase` behind lazy-loaded fail-safe wrappers preserves native Analytics and Crashlytics in `preview`/`production` builds while keeping Expo Go working for local development.
- **Direct `@react-native-firebase/*` calls inside screens/hooks**: Rejected because it scatters native SDK imports, complicates Jest testing, and makes zero-PII and `__DEV__` suppression easy to bypass accidentally.
- **Third-party crash/analytics SaaS (e.g., Sentry + Mixpanel)**: Rejected because Firebase client configs and native SDKs are already integrated for both iOS and Android in a single unified console.
- **Global opt-in consent modal on first launch**: Rejected because telemetry is strictly anonymous with zero PII and adding extra onboarding friction is unnecessary for aggregate product health metrics.

## Consequences

- All Firebase native modules are mocked once at the single testing seam in [jest.setup.js](../../jest.setup.js), allowing unit and screen integration tests to assert exact GA4 events, screen views, and filtered Crashlytics reports through the real service wrappers.
- Unit tests in [analyticsService.test.ts](../../src/services/__tests__/analyticsService.test.ts) and [crashlyticsService.test.ts](../../src/services/__tests__/crashlyticsService.test.ts) explicitly verify the missing-native-module fallback so future changes cannot accidentally reintroduce eager native imports that break Expo Go.
- Future features are guided by [.agents/rules/telemetry.md](../../.agents/rules/telemetry.md) to evaluate Analytics and Crashlytics coverage consistently without introducing PII.
- Before shipping iOS Analytics, Google Analytics must be enabled for the iOS app in Firebase Console and `firebase/GoogleService-Info.plist` refreshed (`IS_ANALYTICS_ENABLED: true`), followed by a local `npx expo prebuild` / `pod install`.
