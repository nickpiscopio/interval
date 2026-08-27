# ADR 0028: Multilingual Localization Architecture (English, Spanish, French)

## Status
Accepted

## Context
To broaden Interval's global reach and provide an accessible, native experience across diverse locales, the application requires complete end-to-end localization supporting English (`en`), Spanish (`es`), and French (`fr`). Every user-facing UI string, badge title/description, exercise catalog name, generated workout title, and viral share message must automatically adapt to the user's active device language with zero runtime overhead or missing keys.

## Decision
1. **Localization Engine (`i18n-js` + `expo-localization`)**:
   - Integrated `expo-localization` to read the primary device locale (`getLocales()[0]`).
   - Configured `i18n-js` with translations for `en`, `es`, and `fr`, setting English as the fallback default (`i18n.enableFallback = true`).
   - Exported a lightweight helper `t(key, options)` to perform type-safe translations with parameter interpolation across all screens and services.

2. **Hierarchical Translation Dictionaries**:
   - `src/i18n/en.json`, `src/i18n/es.json`, and `src/i18n/fr.json` organize namespaces logically: `common`, `selectTimer`, `createTimer`, `timer`, `completion`, `awards`, `generateTimer`, `timerGenerator`, `badges`, and `exercises`.

3. **Dynamic Catalog Localizers**:
   - **Exercise Catalog**: Added `getLocalizedExercise(exercise)` and `getLocalizedCategoryName(category)` which translate exercise names and muscle categories via translation keys like `exercises.<id>.name`.
   - **Badge System**: Added `getLocalizedBadge(badge)` and `getLocalizedBadges(badges)` which translate badge names, taglines, and unlock requirement descriptions via `badges.<id>.name`, `badges.<id>.tagline`, and `badges.<id>.description`.

4. **Localized AI Coaching Engine (`timerGenerator.ts`)**:
   - Workout generation parameters, target focus areas (Full Body, Core Focus, etc.), difficulty levels (Beginner, Int., Pro), goal titles (Fat Burn, Tone & Sculpt, Strength Boost), and rest intervals are localized at generation time using `t()`.

5. **Universal Screen Integration**:
   - All 6 screens (`SelectTimerScreen`, `CreateTimerScreen`, `GenerateTimerScreen`, `TimerScreen`, `CompletionScreen`, `AwardsScreen`) invoke `t()` for labels, headers, dialogs, buttons, placeholders, and deep link share messages.

## Consequences
- **Positive**: Complete localized experience across all supported languages (English, Spanish, French). Adding new languages is as simple as adding a `<lang>.json` dictionary file.
- **Positive**: Strict compile-time checks via TypeScript verify full coverage across catalogs, badges, and components.
