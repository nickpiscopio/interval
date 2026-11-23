# ADR 0034: Enforce 90%+ Code Coverage, Localization Parity Suite, and Definition of Done Skill

## Status
Accepted

## Context
As the codebase grew across screens, interactive components, gamified services, workout generators, and multilingual localization dictionaries, manual testing became insufficient to prevent regressions and string key misses.

A strict quality bar was required:
1. At least 90% statement/line test coverage across core functionality and UI components.
2. Complete localization coverage ensuring zero missing keys and 100% dictionary parity across English, Spanish, and French.
3. Automated test commands runnable all at once.
4. Definition of Done (DoD) enforcement skill and rule requiring tests before completing tasks.
5. Release upgrade safety verification against the previous released version to catch breaking persisted storage changes and native install/upgrade incompatibilities.

## Decision
1. **Testing Infrastructure**:
   - Configured Jest and React Native Testing Library (`@testing-library/react-native@12.9.0`) compatible with React 19 and Expo 54.
   - Standardized Jest setup mocks (`jest.setup.js`) for AsyncStorage, Audio, Haptics, Video, Reanimated, DraggableFlatList, Localization, and Safe Area Insets.
2. **Comprehensive Test Suites**:
   - Implemented 26 unit and UI test files spanning 100% of application modules:
     - `src/services/` (`timerGenerator`, `badgeService`)
     - `src/constants/` (`exerciseCatalog`, `badges`, `defaultTimers`, `styleConstants`)
     - `src/i18n/` (`i18n.test.ts` with static codebase AST scanning and JSON dictionary parity checks)
     - `src/components/` (`Themed`, `Input`, `IntervalInput`, `CustomAlertModal`, `ExercisePickerModal`, `PrimaryButton`, `HelperComponents`)
     - `src/context/` (`AlertContext`)
     - `src/screens/` (`SelectTimerScreen`, `CreateTimerScreen`, `TimerScreen`, `CompletionScreen`, `AwardsScreen`, `GenerateTimerScreen`, `NotFoundScreen`)
     - `src/navigation/` (`Navigation`)
3. **Definition of Done Customizations**:
   - Created skill `.agents/skills/test-and-verify/SKILL.md` to run the full test suite with `npm run test:coverage` and verify the 5-step DoD checklist (`[Step x/5] <Step Title>`).
   - Created rule `.agents/rules/definition-of-done.md` establishing mandatory test creation, >= 90% coverage threshold verification, 100% localization parity, zero failing tests, and a 5th mandatory **Upgrade & Migration Check** on all code changes.
   - **Step 5 — Upgrade & Migration Check**:
     - **Comparison Baseline**: Compare against the latest release git tag if present; if no tags exist, fall back to the most recent commit that bumped the release version or build number in app configuration (`app.json`) or native build settings (`android/app/build.gradle`, iOS `Info.plist` / project settings). Releases should be tagged in git going forward to keep this baseline deterministic.
     - **Persisted Storage & Schemas**: Check changes to persisted `AsyncStorage` keys and model schemas, mandating an idempotent migration script and an automated upgrade test simulating the previous released version's storage shape whenever breaking changes occur.
     - **Native Install/Upgrade Compatibility**: Check version codes, build numbers, permissions, and native configuration to ensure store upgrades install cleanly over prior builds.

## Consequences
- 100% automated regression protection across UI, business logic, and localization.
- Fast local verification (`npm run test:coverage` runs 26 suites, 97 tests in < 3s).
- Guaranteed multilingual completeness for new features.
- Upgrade safety for existing users: breaking `AsyncStorage` schema changes require idempotent migrations and automated upgrade tests, and native install/upgrade incompatibilities are caught before release.
