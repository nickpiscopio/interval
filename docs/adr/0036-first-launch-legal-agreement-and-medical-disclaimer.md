# ADR 0036: First-Launch Legal Agreement & Medical Disclaimer

## Status
Accepted

## Context
Interval provides HIIT workouts, custom interval timing, AI workout generation, and physical therapy / corrective exercise recommendations. Users must be explicitly informed prior to engaging in physical activity that they participate at their own risk, that Interval's exercise content constitutes educational recommendations rather than personalized medical diagnosis or treatment, and that they must consult a physician before beginning any exercise routine. Users must agree to these terms on first launch before accessing the app, and the legal agreement must remain accessible for review anytime via an in-app menu.

## Decision
1. **First-Launch Non-Dismissible Gate**:
   - Implement a blocking modal gate (`LegalDisclaimerModal`) on `SelectTimerScreen` that displays automatically upon first app launch if `@legal_disclaimer_accepted` is missing in `AsyncStorage`.
   - Prevent background interaction or dismissal until the user taps **"I Understand & Agree"**, which persists the acceptance status and unlocks the application.
2. **Reviewable Menu & Legal Info Modal**:
   - Add an Info/Legal button in the top header of `SelectTimerScreen` (adjacent to the Trophy Room button).
   - Tapping the icon opens the reviewable `LegalDisclaimerModal` with full medical terms, assumption of risk, AI recommendation disclaimers, app version, and attribution.
3. **Comprehensive 4-Part Plain-Language Disclaimer**:
   - *Voluntary Participation & Assumption of Risk*: User uses Interval voluntarily at their own risk with no compulsion.
   - *AI & PT Recommendations as Non-Medical Advice*: Timer structures and exercise catalog (including PT/corrective movements) are informational recommendations only.
   - *Mandatory Physician Consultation*: Requirement to consult a doctor or healthcare provider prior to starting any fitness or rehabilitation program.
   - *Limitation of Liability & Safe Practice*: Immediate cessation upon pain/discomfort and standard liability waiver.
4. **Multilingual Parity & Test Coverage**:
   - Provide 100% complete translations across `en.json`, `es.json`, and `fr.json`.
   - Maintain >= 90% statement/line test coverage with automated unit and UI interaction tests enforcing the Definition of Done.

## Consequences
- Protects the application and operators legally regarding user health, injury risk, and medical disclaimers.
- Provides a clean, frictionless single-tap onboarding acknowledgement for first-time users.
- Gives users permanent, transparent access to review terms and medical guidelines whenever desired.
