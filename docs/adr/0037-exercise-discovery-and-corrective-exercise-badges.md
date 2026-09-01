# ADR 0037: Exercise Discovery & Corrective Exercise Achievement Badges

## Status
Accepted

## Context
With the introduction of the Physical Therapy & Corrective Exercise catalog and the deep anatomical search library, users should be motivated and rewarded for exploring exercises, discovering movements across different body parts, and completing corrective / rehabilitation workouts.

## Decision
1. **New Achievement Milestones**:
   - **Search & Discovery Tier**:
     - `curious_explorer`: Performed an exercise library search or filtered by body parts.
     - `anatomical_master`: Explored exercises across multiple body parts and joints.
     - `movement_scholar`: Inspected full form instructions and corrective benefits across exercises.
   - **Corrective & Physical Therapy Tier**:
     - `rehab_rookie`: Completed first corrective / physical therapy routine.
     - `bulletproof_joints`: Completed 5 corrective or mobility workout sessions.
     - `posture_perfectionist`: Completed 15 physical therapy & corrective intervals.
     - `iron_alignment`: Completed 10 full corrective workout routines.
2. **Batch Workout Evaluation Lifecycle**:
   - Evaluate all badge unlocks upon workout completion in `recordWorkoutCompletion(timer, workoutSeconds)` in `badgeService.ts`.
   - Track `totalCorrectiveWorkouts`, `totalCorrectiveIntervals`, `totalSearches`, and `exploredBodyParts` in `UserStats`.
3. **Celebration & Sharing**:
   - Celebrate newly unlocked discovery and corrective badges on `CompletionScreen.tsx` with celebratory haptics, gradient badge card, and viral share message generator.
4. **Multilingual Parity & Test Coverage**:
   - Full translations across `en.json`, `es.json`, and `fr.json` for all 7 new badge titles, taglines, and descriptions.
   - Maintain >= 90% test coverage with automated unit and UI interaction tests enforcing the Definition of Done.

## Consequences
- Reinforces user engagement and retention around daily mobility, rehabilitation, and anatomical exploration.
- Integrates physical therapy into the gamified achievements ecosystem.
