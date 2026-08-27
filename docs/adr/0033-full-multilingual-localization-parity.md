# ADR 0033: Full Multilingual Localization Parity Across All Screens & Dictionaries

## Status
Accepted

## Context
During systemic audit, several missing localization keys (`createTimer.titleDetails`, `createTimer.timerNamePlaceholder`, `createTimer.importBanner`, `createTimer.intervalColor`, `createTimer.copySuffix`, `timer.preparing`, `notFound.*`, `common.days`, `awards.badgesLabel`, and `exercises.flutter_kicks`) and hardcoded fallback strings were identified across screens and navigation options.

## Decision
1. **100% Dictionary Key Parity Across English, Spanish, and French**:
   - Added all missing keys to `src/i18n/en.json`, `src/i18n/es.json`, and `src/i18n/fr.json`.
   - Guaranteed full coverage for every exercise in `exerciseCatalog.ts` (including `flutter_kicks`).
2. **Screen & Navigation Localization**:
   - Localized stack navigation screen titles in `src/navigation/index.tsx`.
   - Localized fallback loading strings in `src/screens/TimerScreen.tsx`.
   - Localized the not found screen (`src/screens/NotFoundScreen.tsx`).
   - Localized duplicated interval suffix, interval color label, and import banner in `src/screens/CreateTimerScreen.tsx`.
   - Replaced string checks with `common.days` and `awards.badgesLabel` in `src/screens/AwardsScreen.tsx`.
3. **Automated Audit Safeguards**:
   - Created automated scripts to verify key parity and prevent future missing string regressions.

## Consequences
- **Positive**: Seamless multilingual experience across English, Spanish, and French with zero missing translation keys or hardcoded English fallbacks.
