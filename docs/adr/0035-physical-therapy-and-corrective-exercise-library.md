# ADR 0035: Physical Therapy & Corrective Exercise Library with Anatomical Search

## Status
Accepted

## Context
Users need targeted mobility, rehabilitation, and corrective exercises filterable by friendly anatomical joint/body areas (ankle, pelvic floor, knee, elbow, wrist, lower back, upper back, neck, hips, etc.). Users also need comprehensive form descriptions and instructions that are deeply searchable across the entire catalog and accessible both from the timer creator and directly from a dedicated tab on the main screen.

## Decision
1. **Domain Model & Taxonomy**:
   - Added a `corrective` category to the Exercise catalog alongside standard HIIT categories (`cardio`, `upper`, `lower`, `abs`, `total`).
   - Extended `Exercise` interface with `bodyParts: BodyPart[]` (`ankle_feet`, `knees`, `pelvic_floor`, `lower_back`, `upper_back_shoulders`, `neck`, `wrists_hands`, `elbows_forearms`, `hips_glutes`, `abs_core`, etc.) and localized `description` / step-by-step instructions.
   - Enforced user-friendly, non-clinical anatomical naming in all UI labels and localizations (e.g., "Ankle & Feet" instead of "Talocrural", "Lower Back" instead of "Lumbar Spine").
2. **Search & Deep Text Querying**:
   - Upgraded search matching to query across Exercise Title, Category, Body Part tags, Target Muscles, and Full Instructional Descriptions in real-time.
3. **Dedicated Library & Detail Modal**:
   - Added a bottom navigation dock on `SelectTimerScreen` allowing instant switching between **"Workouts"** and the **"Exercise & PT Library"**.
   - Created `ExerciseDetailModal` displaying full form instructions, clinical cues, target muscles, body parts, and dual action buttons:
     - Standalone Library: **"Start Quick Routine"** (starts 3-round timed workout) and **"Create Custom Workout"** (initializes timer builder).
     - Timer Editor: **"Add to Timer"** (appends or replaces interval).
4. **Multilingual Parity & Testing**:
   - Fully translated all new exercises, descriptions, body parts, and categories in `en.json`, `es.json`, and `fr.json`.
   - Covered all new models, helpers, components, and interactions with automated unit/UI tests maintaining >= 90% statement/line test coverage.

## Consequences
- Expands app utility from pure interval cardio into daily joint mobility, warm-up, and physical therapy rehab.
- Enables discovery of exercises via symptom/injury searches (e.g. searching "lower back" or "knee rehab").
- Provides one-tap quick start directly from the exercise library.
