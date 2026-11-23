# Definition of Done (DoD) Rule

Whenever implementing, modifying, or refactoring functionality in this repository, the Definition of Done (DoD) requires:

1. **Automated Tests Required**:
   - Every new piece of functionality, component, screen, or service MUST have accompanying automated unit and/or UI tests written using Jest and `@testing-library/react-native`.

2. **90%+ Coverage Enforcement**:
   - The test suite must maintain >= 90% statement and line coverage globally across functionality and UI components.
   - Run `npm run test:coverage` to verify that coverage thresholds are satisfied.

3. **100% Localization Key Parity**:
   - No hardcoded customer-facing strings in UI components.
   - All string keys must exist and match across English (`en.json`), Spanish (`es.json`), and French (`fr.json`).
   - The AST scanner in `src/i18n/__tests__/i18n.test.ts` must pass with zero missing or orphan keys.

4. **Zero Failing Tests**:
   - All test suites must pass without errors or unhandled promise rejections before completing any task.

5. **Upgrade & Migration Check**:
   - Compare changes against the previous released version using the latest release git tag if present. If no release tags exist, fall back to the most recent commit that bumped the release version or build number in app configuration (`app.json`) or native build settings (`android/app/build.gradle`, iOS `Info.plist` / project settings). *(Recommendation: tag releases in git going forward so the comparison baseline is unambiguous.)*
   - **Persisted Storage & Model Schemas**: Inspect all changes to persisted `AsyncStorage` keys and stored model schemas. Whenever breaking changes occur, implement an idempotent migration script and an automated upgrade test simulating the previous released version's storage shape.
   - **Native Install & Upgrade Compatibility**: Verify changes to version codes, build numbers, permissions, and native configuration remain compatible with upgrading over prior builds.
