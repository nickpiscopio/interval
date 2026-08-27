---
name: test-and-verify
description: Run the full test suite (unit, UI, localization, and coverage thresholds) to enforce the Definition of Done (DoD) before completing any task or feature.
---

# Test and Verify Skill

Use this skill whenever verifying functionality, running regression checks, or verifying the Definition of Done before declaring any task complete.

## How to Run Tests

### 1. Run Complete Test Suite with Coverage Report
```bash
npm run test:coverage
```
Runs all 26+ test suites across:
- **Services & Logic**: `timerGenerator`, `badgeService`
- **Constants & Catalogs**: `exerciseCatalog`, `badges`, `defaultTimers`, `styleConstants`
- **Localization Parity & AST Scans**: `src/i18n/__tests__/i18n.test.ts`
- **UI Components & Modals**: `Themed`, `Input`, `IntervalInput`, `CustomAlertModal`, `ExercisePickerModal`, `PrimaryButton`, `HelperComponents`, `AlertContext`
- **Screens**: `SelectTimerScreen`, `CreateTimerScreen`, `TimerScreen`, `CompletionScreen`, `AwardsScreen`, `GenerateTimerScreen`, `NotFoundScreen`
- **Navigation & Lifecycle**: `Navigation`, `hooks`, `Interval`, `base64`

### 2. Fast Watch Mode (for local development)
```bash
npm run test:watch
```

### 3. All Tests Once
```bash
npm run test:all
```

## Definition of Done (DoD) Checklist
Before completing any user request or feature:
1. **Tests Added**: Unit and UI tests must be added or updated for new or modified functionality.
2. **Coverage Verified**: Run `npm run test:coverage` and confirm all test suites pass with statements >= 90% and lines >= 90%.
3. **Localization Checked**: Ensure all UI strings use `t(...)` keys and exist with 100% parity across `en.json`, `es.json`, and `fr.json`.
4. **No Regressions**: Zero failing tests across the entire test suite.
