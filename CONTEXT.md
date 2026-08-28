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

**Legal Agreement & Medical Disclaimer**:
A mandatory first-launch acknowledgement and reviewable legal terms informing the user of voluntary participation, assumption of personal risk, non-medical nature of AI & physical therapy exercise recommendations, and the requirement to consult a physician.
_Avoid_: EULA, Fine Print

**Discovery & Corrective Badges**:
Gamified achievement awards unlocked when exploring the exercise library and completing physical therapy / mobility routines.
_Avoid_: Trophies, Points, Quest Rewards

**Duration Shift-Register Input**:
A numeric text entry mechanism for interval duration that queues digits right-to-left up to 6 digits formatted as `00:00:00` (`HH:MM:SS`), calculating total seconds without mid-keystroke conversions.
_Avoid_: Time Picker Wheel, Single-Digit Parser

**Keyboard-Aware Docked Editor**:
A bottom-anchored carousel editor panel that persists touch events (`keyboardShouldPersistTaps="handled"`) and dynamically adjusts safe-area insets when the software keyboard opens, preventing downward layout shifts and missed taps.
_Avoid_: Floating Action Sheet, Modal Drawer
