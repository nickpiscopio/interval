# ADR 0032: Comprehensive 70+ Bodyweight Exercise Library & Smart Recommendation Engine

## Status
Accepted

## Context
Rather than relying on third-party cloud AI APIs with recurring costs, network latency, rate limits, and external dependencies, the application required a rich, deterministic, 100% offline athletic recommendation system. The user also required a significantly expanded library of curated bodyweight movements that users can browse and select when manually building custom timers.

## Decision
1. **70+ Curated Bodyweight Exercise Library (`src/constants/exerciseCatalog.ts`)**:
   - Expanded the exercise library from 24 to 70 comprehensive bodyweight exercises across 6 core movement domains:
     - **Cardio HIIT (10)**: Jumping Jacks, High Knees, Mountain Climbers, Burpees, Skater Jumps, Tuck Jumps, Shadow Boxing, Star Jumps, Butt Kicks, Fast Feet.
     - **Upper Body (12)**: Push-Ups, Wide-Grip Push-Ups, Diamond Push-Ups, Pike Push-Ups, Dips, Arm Circles, Plank Shoulder Taps, Inchworms, Superman, Prone Y-T-W, Incline Push-Ups, Decline Push-Ups.
     - **Lower Body & Glutes (14)**: Air Squats, Sumo Squats, Jump Squats, Forward Lunges, Reverse Lunges, Side Lunges, Curtsy Lunges, Glute Bridges, Single-Leg Bridges, Wall Sit, Calf Raises, Donkey Kicks, Fire Hydrants, Single-Leg RDLs.
     - **Core & Abs (14)**: Forearm Plank, High Plank, Side Plank, Crunches, Bicycle Crunches, Russian/Mason Twists, Leg Raises, Flutter Kicks, Scissor Kicks, Dead Bug, Bird Dog, Hollow Body Hold, Cross-Body Climbers, Plank Jacks.
     - **Full Body Explosive (10)**: Bear Crawl, Crab Walk, Sprawls, Climber to Push-Up, Squat Thrusts, Walkouts, Split Squat Jumps, Skater Hops, Burpee Tuck Jump, Star Jacks.
     - **Mobility & Recovery (10)**: Jog in Place, Leg Swings, Shoulder Stretch, Tricep Stretch, Quad Stretch, Toe Touch, Cat Cow, Child's Pose, Cobra Pose.
   - Each exercise contains step-by-step coaching cues and difficulty ratings.

2. **Smart Coaching Recommendation Engine (`src/services/timerGenerator.ts`)**:
   - Implemented an intelligent rules engine utilizing **Antagonist Movement Balancing** (alternating push vs pull vs lower vs core vs cardio) to prevent localized muscle exhaustion.
   - Tailors work/rest intervals based on user experience level:
     - Beginner: 30s active / 15s rest (3 rounds, 4 exercises/cycle)
     - Intermediate: 40s active / 15s rest (4 rounds, 5 exercises/cycle)
     - Advanced: 45s active / 15s rest (4 rounds, 6 exercises/cycle)
   - Generates contextual, motivating localized workout titles.

3. **Searchable Exercise Picker Modal (`src/components/ExercisePickerModal.tsx`)**:
   - Built a searchable, filterable category modal sheet accessible directly inside `CreateTimerScreen` via a 1-tap "Library" button.
   - Selecting any exercise auto-fills the interval name, exercise ID, and optimal category color indicator.

4. **Multilingual Localization (`en.json`, `es.json`, `fr.json`)**:
   - Fully translated all 70 exercises, coaching instructions, category labels, and picker UI into English, Spanish, and French.

## Consequences
- **Positive**: 100% offline, zero-latency, private, and subscription-free workout generation.
- **Positive**: Dynamic, balanced workouts that feel intelligent and personalized.
- **Positive**: Huge increase in exercise variety and user customization flexibility.
