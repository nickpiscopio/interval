# ADR 0030: Default Daily Workouts (Day 1 - Day 5) and Exercise Catalog Expansion

## Status
Accepted

## Context
Interval provides seeded default HIIT workout routines upon initial installation so users can start training immediately without having to configure custom intervals from scratch. The initial placeholder routines needed to be replaced with 5 daily bodyweight workout routines: Day 1 (Full Body Power Blast), Day 2 (Six-Pack Turbo Abs), Day 3 (Upper Body Muscle Mania), Day 4 (Thunder Legs), and Day 5 (Stretch & Chill). In addition, the exercise catalog and translation dictionaries needed to be expanded to support all exercises featured in these routines.

## Decision
1. **Default Timers Definition (`src/constants/defaultTimers.ts`)**:
   - Replaced default timers with:
     - **Day 1: 💥 Full Body Power Blast!** (2 rounds): Get Ready (10s), Jog in Place (20s), Rest (10s), Squats (20s), Rest (10s), Push-Ups (20s), Rest (10s), Lunges (20s), Rest (10s), Plank (20s).
     - **Day 2: 🔥 Six-Pack Turbo Abs** (2 rounds): Get Ready (10s), Jumping Jacks (20s), Rest (10s), Mountain Climbers (20s), Rest (10s), Bicycle Crunches (20s), Rest (10s), High Knees (20s), Rest (10s), Mason Twists (20s).
     - **Day 3: 💪 Upper Body Muscle Mania** (2 rounds): Get Ready (10s), Arm Circles (20s), Rest (10s), Wide-Grip Push-Ups (20s), Rest (10s), Superman (20s), Rest (10s), Close-Grip Push-Ups (20s), Rest (10s), Superman (20s).
     - **Day 4: 🦵 Thunder Legs** (2 rounds): Get Ready (10s), Left Leg Swings (10s), Right Leg Swings (10s), Rest (10s), Glute Bridges (20s), Rest (10s), Left Side Leg Lifts (10s), Right Side Leg Lifts (10s), Rest (10s), Calf Raises (20s), Rest (10s), Wall Sit (20s), Rest (10s), Squat Jumps (20s).
     - **Day 5: 🧘‍♀️ Stretch & Chill** (3 rounds): Get Ready (10s), Left Arm Shoulder Stretch (10s), Right Arm Shoulder Stretch (10s), Left Arm Tricep Stretch (10s), Right Arm Tricep Stretch (10s), Rest (5s), Seated Toe Touch (10s), Rest (5s), Cat Cow (10s), Left Side Quad Stretch (10s), Right Side Quad Stretch (10s), Rest (5s), Child's Pose (10s).
   - Interval color standard: Active/Work & Warmup = `#1ACC6C`, Rest = `#4B5563`.
   - Ordering is preserved chronologically (Day 1 through Day 5) via descending `createdAt` timestamps.

2. **Exercise Catalog Expansion (`src/constants/exerciseCatalog.ts`)**:
   - Added comprehensive instruction guides and categorizations for all 24 bodyweight exercises including Leg Swings, Stretches, Glute Bridges, Superman, Mason Twists, Wall Sits, Calf Raises, and Cat Cow.

3. **Multilingual Localization**:
   - Added full Spanish (`es.json`) and French (`fr.json`) translations for all 24 exercises and their instructions.

## Consequences
- **Positive**: High quality, progressive daily workout plan available out-of-the-box.
- **Positive**: Rich bodyweight exercise library with step-by-step coaching instructions localized in English, Spanish, and French.
