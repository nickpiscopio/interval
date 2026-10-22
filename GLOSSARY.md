# HIIT Timer Context

A HIIT (High-Intensity Interval Training) application that allows users to create, run, and share custom timers, as well as generate them using AI with bodyweight exercises and instructional videos.

## Language

**Timer**:
A configured workout template consisting of a sequence of intervals and a number of rounds.
_Avoid_: Workout, Preset

**Interval**:
A designated time segment of a Timer, which has a specific duration, background color, Interval Sound, and optional exercise reference.
_Avoid_: Step, Phase, Block

**Interval Sound**:
The audio cue an Interval plays when it begins or when the timer resumes, chosen from a fixed list of bundled sounds or "None" for silence. Plays strictly once as a crisp, non-looping cue upon interval entry and timer resume, pauses before rewinding/playing to prevent buffer collisions, releases all native player resources on completion, exit, or unmount without lingering instances, and previews strictly once per distinct selection change in the Interval Edit Bottom Sheet with duplicate taps suppressed.
_Avoid_: Alarm, Ringtone, Beep (a beep is just one of the sounds)

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

**Interval Edit Bottom Sheet**:
A dedicated slide-up bottom sheet modal (`@gorhom/bottom-sheet`) for inspecting and editing an individual interval's name, duration, color, and Interval Sound with concise form labels ('Name', 'Duration', 'Color', 'Sound'), bold library launcher button (`Poppins-Bold`), a top-right checkmark button (`checkmark-sharp`) bounded strictly to a 44x44 touch target with zero hitSlop spillover and an optical offset (`marginRight: -10`) aligning the glyph flush at 16px from the right boundary, in-sheet drill-down navigation to the Exercise Library (expanding to 90% height with zero container padding via `noPadding` so the catalog renders with its own edge-to-edge margins identical to the library tab, an icon-only back button without circular backdrop and no close button), safe-area bottom clearance (`insets.bottom + Spacing.lg`), dynamic sequence placeholder fallback (`Interval X` and `00:00:30` default duration), deferred addition until saved/done, duplicate duration validation, and self-contained keyboard avoidance.
_Avoid_: Carousel Slider, Inline Accordion, Optimistic Empty Interval Addition, Stacked Bottom Sheet Modals, Circular Border Back Buttons in Sheet Headers, Touch Target Whitespace Spillover, Double-Padded Sheet Catalog Drill-Downs

**Floating Navigation Bar & Action Buttons**:
A translucent floating bottom bar for switching between Workouts and Exercise Library with stacked floating action buttons (FABs) on the bottom-right for timer generation and creation.
_Avoid_: Tab Bar Dock, Bottom Action Sheet

**Input Label**:
A micro-typography field identifier placed directly above interactive inputs, form fields, filter carousels (e.g., 'Category' and 'Body Part' in the Exercise Library), and selector palettes (`FontSize.xs: 12`, `Poppins-Bold`, `Colors.textScale.secondary`) with optical spacing (`Spacing.inputLabelGap: 4`).
_Avoid_: Field Header, Input Header, Form Header

**Design System Tokens & Hierarchy**:
Single-source-of-truth token architecture (`Colors`, `Spacing`, `FontSize`, `RADIUS`, `TOUCH_TARGET`, `SHADOWS`) strictly enforced across all components and screens without hardcoded values. Includes a 4-tier semantic corner radius scale (`RADIUS.sm: 8`, `RADIUS.md: 16`, `RADIUS.lg: 24`, `RADIUS.full: 9999`), universal bold lettering for text buttons (`Poppins-Bold`), enhanced icon+text button padding (`gap: Spacing.sm`), optical input label pairing (`Spacing.inputLabelGap: 4`), clean borderless surface cards with `SHADOWS.card`, optical icon alignment (`marginLeft: -10` on back buttons, `marginRight: -10` on right actions) aligning 24px glyphs flush with the 16px content margin while maintaining vertical centering with titles, edge-to-edge scrollable card architecture where items own `marginHorizontal: Spacing.md` and boundary margins so cards scroll cleanly under headers without clipping drop shadows, zero-padding sheet wrappers (`noPadding` on `BottomSheetFrame`) when embedding self-contained views that manage their own edge-to-edge margins, unified shadow presets, dynamic type accessibility scaling, and safe-area list scrolling depth.
_Avoid_: Hardcoded Hex Codes, Arbitrary Pixel Heights, Inline Shadow Literals, Card Borders, Unbolded Button Text, Padded Scroll Containers Clipping Card Shadows, Misaligned Header Glyph Margins, Nested Sheet Padding Redundancy

**Dynamic Contextual Motivations**:
An intelligent post-workout motivation generator that dynamically evaluates workout duration, total rounds completed, and day of the week to deliver whimsical, fresh, and motivating celebration copy encouraging daily habit retention.
_Avoid_: Static Victory Message, Generic Congratulations

**Contextual Selection & Reorder Header Mode**:
A clean timer card list interaction where cards have no permanent drag handles. Long-pressing (holding) any card activates a contextual header bar allowing sharing, dedicated list drag-and-drop reordering, and batch deletion.
_Avoid_: Permanent Drag Handles, Inline Delete Swipe Clutter

**Snappy Reorder Physics & Continuous Shadow Interpolation**:
High-stiffness, overshoot-clamped spring physics (`REORDER_SPRING_CONFIG`) and real-time Reanimated shadow interpolation (`useOnCellActiveAnimation`), ensuring dragged items settle crisply in ~120ms to persist immediately while shadows smoothly glide between resting (`SHADOWS.card`) and floating states without sudden snapping or delay.
_Avoid_: Sluggish Release Springs, Abrupt Shadow Popping

**Workout Completion Audio**:
An automatic audio celebration cue (`beep_3` triple beep) that triggers when the final interval finishes and the Workout Completed screen is presented, reinforcing routine conclusion.
_Avoid_: Mid-Timer Completion Sound, Silent Completion Screen

**Badge & Award Modal Overlay**:
A standardized celebration and inspection dialog featuring a unified translucent backdrop (`Colors.surface.overlay`), full-screen safe area coverage (`statusBarTranslucent={true}`), and tap-to-dismiss backdrop pressability.
_Avoid_: Opaque Dark Overlays, Unresponsive Backdrop Taps, Status Bar Clipping
