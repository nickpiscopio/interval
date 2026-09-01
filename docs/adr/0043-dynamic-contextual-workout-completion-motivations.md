# ADR 0043: Dynamic Contextual Workout Completion Motivations

## Status
Accepted

## Context
When completing a workout on `CompletionScreen`, users were previously shown static text (`"You crushed <name>!"`). To maintain high engagement and avoid repetitive messaging, the user needs dynamic, whimsical, and motivational post-workout copy that encourages returning tomorrow for their next session.

Furthermore, the trophy visual hierarchy needed refinement: the trophy was oversized and placed above text without an integrated title hierarchy.

## Decision
1. **Visual Hierarchy & Compact Trophy**:
   - Resized the trophy icon to a compact **44px** rendered inside a circular card surface bubble (`trophyBubble`, 68x68, `Colors.surface.card`, `...SHADOWS.card`).
   - Positioned the primary title (`"Workout Complete! ⚡️"`) directly beneath the trophy.
   - Positioned the dynamic motivational prompt as the subtitle immediately below the title.

2. **Context-Aware Dynamic Motivational Engine (`motivationalMessageService.ts`)**:
   - Evaluates multi-factor context upon workout completion:
     - **Day of Week** (Sunday through Saturday specific motivational themes).
     - **Workout Duration** (quick sprints `< 5 min` vs endurance sessions `≥ 15 min`).
     - **Round Volume** (high-volume sessions `≥ 5 rounds`).
   - Supports multiple randomized variants per context to guarantee freshness.
   - Full multilingual parity across English (`en.json`), Spanish (`es.json`), and French (`fr.json`).

3. **Borderless Stats Card**:
   - Conformed the workout stats summary card to the universal borderless card standard (`backgroundColor: Colors.surface.card`, `...SHADOWS.card`, `borderWidth: 0`).

## Consequences
- The completion experience feels celebratory, engaging, and fresh on every workout.
- Copy scales dynamically with dynamic type and localization.
