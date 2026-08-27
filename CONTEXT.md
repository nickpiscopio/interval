# HIIT Timer Context

A HIIT (High-Intensity Interval Training) application that allows users to create, run, and share custom timers, as well as generate them using AI with bodyweight exercises and instructional videos.

## Language

**Timer**:
A configured workout template consisting of a sequence of intervals and a number of rounds.
_Avoid_: Workout, Preset

**Interval**:
A designated time segment of a Timer, which has a specific duration, background color, and optional exercise reference.
_Avoid_: Step, Phase, Block

**Exercise**:
A bodyweight physical movement (e.g., Pushups) performed during an interval, containing instructional metadata and video demonstrations.
_Avoid_: Workout, Activity

**Round**:
A full repetition of the sequence of intervals defined in a Timer.
_Avoid_: Set, Cycle

**Physical Therapy / Corrective Exercise**:
A targeted mobility, stability, or rehabilitation movement designed to strengthen specific joints, relieve tension, or aid recovery.
_Avoid_: Rehab Drill, Clinical Protocol

**Body Part Focus**:
Everyday user-friendly anatomical regions (e.g., Ankle & Feet, Knees, Pelvic Floor, Lower Back, Upper Back, Neck, Wrists & Hands, Elbows, Hips & Glutes, Shoulders) used for filtering and discovering exercises.
_Avoid_: Medical Jargon (e.g., Cervical Spine, Lumbar, Talocrural, Patellofemoral)
