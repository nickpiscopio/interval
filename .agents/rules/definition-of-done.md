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
