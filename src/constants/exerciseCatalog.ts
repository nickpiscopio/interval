import { Exercise, BodyPart } from "../model/Exercise";
import { t } from "../i18n";

export interface BodyPartItem {
  id: BodyPart;
  name: string;
  iconName: string;
}

export const BODY_PART_CATALOG: BodyPartItem[] = [
  { id: "ankle_feet", name: "Ankle & Feet", iconName: "footsteps-outline" },
  { id: "knees", name: "Knees", iconName: "fitness-outline" },
  { id: "pelvic_floor", name: "Pelvic Floor", iconName: "shield-checkmark-outline" },
  { id: "lower_back", name: "Lower Back", iconName: "body-outline" },
  { id: "upper_back_shoulders", name: "Upper Back & Shoulders", iconName: "barbell-outline" },
  { id: "neck", name: "Neck", iconName: "person-outline" },
  { id: "wrists_hands", name: "Wrists & Hands", iconName: "hand-left-outline" },
  { id: "elbows_forearms", name: "Elbows & Forearms", iconName: "hand-right-outline" },
  { id: "hips_glutes", name: "Hips & Glutes", iconName: "walk-outline" },
  { id: "abs_core", name: "Abs & Core", iconName: "flame-outline" },
  { id: "chest", name: "Chest", iconName: "heart-outline" },
  { id: "arms", name: "Arms", iconName: "bicycle-outline" }
];

export const EXERCISE_CATALOG: Exercise[] = [
  // ==========================================
  // PHYSICAL THERAPY & CORRECTIVE (20)
  // ==========================================
  {
    id: "tibialis_raises",
    name: "Tibialis Raises",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["ankle_feet", "knees"],
    targetMuscles: ["Tibialis Anterior", "Ankle Dorsiflexors"],
    description: "Strengthens the shin muscles to absorb ground impact, relieve shin splints, and support knee joint stability.",
    instructions: [
      "Stand with back flat against a wall, feet about 1-2 feet out.",
      "Keeping knees straight, pull toes and balls of feet up toward shins.",
      "Hold the contraction at the top for 1 second.",
      "Lower feet smoothly back to the floor and repeat."
    ]
  },
  {
    id: "ankle_alphabet",
    name: "Ankle Alphabet",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["ankle_feet"],
    targetMuscles: ["Ankle Invertors", "Evertors", "Plantarflexors"],
    description: "Improves multi-directional range of motion, proprioception, and rehabilitation after ankle sprains.",
    instructions: [
      "Sit comfortably with foot elevated off the ground.",
      "Point your big toe and trace uppercase letters A through Z in the air.",
      "Move only from the ankle joint, keeping knee still.",
      "Perform full range of motion for each letter."
    ]
  },
  {
    id: "calf_eccentric_drops",
    name: "Calf Stretch & Heel Drops",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["ankle_feet"],
    targetMuscles: ["Gastrocnemius", "Soleus", "Achilles Tendon"],
    description: "Controlled eccentric lowering to strengthen the Achilles tendon and relieve calf tightness.",
    instructions: [
      "Stand with balls of feet on a step or ledge, heels hanging off.",
      "Rise up onto toes with both feet.",
      "Slowly lower heels below step level over 3-4 seconds.",
      "Feel a gentle stretch in calves, then rise back up."
    ]
  },
  {
    id: "toe_heel_walks",
    name: "Toe & Heel Walks",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["ankle_feet"],
    targetMuscles: ["Foot Intrinsics", "Calves", "Tibialis"],
    description: "Strengthens foot arch intrinsics, enhances balance, and restores walking gait mechanics.",
    instructions: [
      "Walk forward on the balls of your toes for 10-15 paces.",
      "Switch to walking exclusively on your heels with toes lifted.",
      "Maintain upright posture with engaged core throughout."
    ]
  },
  {
    id: "terminal_knee_extensions",
    name: "Terminal Knee Extensions",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["knees"],
    targetMuscles: ["Vastus Medialis Oblique (VMO)", "Quadriceps"],
    description: "Isolates the inner quad to improve patellofemoral tracking and reduce anterior knee pain.",
    instructions: [
      "Stand with slight bend in working knee (or loop light resistance band behind knee).",
      "Squeeze your thigh to straighten knee fully without hyperextending.",
      "Hold the peak quad squeeze for 2 seconds.",
      "Control the return back to a soft knee bend."
    ]
  },
  {
    id: "straight_leg_raises",
    name: "Straight Leg Raises",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["knees", "hips_glutes"],
    targetMuscles: ["Rectus Femoris", "Hip Flexors"],
    description: "Gentle non-weight-bearing knee extensor and hip flexor strengthening to protect healing knee joints.",
    instructions: [
      "Lie flat on back with one knee bent and one leg straight.",
      "Flex toes of straight leg toward shin and tighten quad.",
      "Lift straight leg up to the height of the opposite knee.",
      "Pause for 1 second, then slowly lower without touching floor."
    ]
  },
  {
    id: "wall_sit_isometric",
    name: "Wall Sit Knee Isometric Hold",
    category: "corrective",
    difficulty: "intermediate",
    bodyParts: ["knees", "hips_glutes"],
    targetMuscles: ["Quadriceps", "Patellar Tendon", "Glutes"],
    description: "Isometric quad loading that stimulates collagen synthesis and relieves patellar tendon discomfort.",
    instructions: [
      "Lean back against a smooth wall and slide down until knees are at 45 to 90 degrees.",
      "Keep knees directly aligned above ankles, not past toes.",
      "Press flat back firmly into wall and breathe evenly.",
      "Hold steady without bouncing."
    ]
  },
  {
    id: "step_downs",
    name: "Controlled Step-Downs",
    category: "corrective",
    difficulty: "intermediate",
    bodyParts: ["knees", "hips_glutes", "ankle_feet"],
    targetMuscles: ["VMO", "Gluteus Medius", "Hamstrings"],
    description: "Develops single-leg stability, eccentric quad deceleration, and prevents knee collapse during stairs and runs.",
    instructions: [
      "Stand on a low step or box with one foot hovering off the side.",
      "Hinge slightly at hips and bend standing knee to tap heel to floor.",
      "Keep standing knee tracking inline with second toe.",
      "Drive through heel to return to top."
    ]
  },
  {
    id: "kegel_holds",
    name: "Kegel Holds & Pulses",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["pelvic_floor", "abs_core"],
    targetMuscles: ["Pelvic Floor Muscles", "Transverse Abdominis"],
    description: "Foundational pelvic floor activation to restore deep core stability, continence, and posture.",
    instructions: [
      "Lie on back with knees bent and feet flat on floor.",
      "Exhale gently and contract the pelvic floor as if stopping urine flow.",
      "Draw muscles upward and inward without squeezing glutes.",
      "Hold for 5 seconds, relax fully for 5 seconds, and repeat."
    ]
  },
  {
    id: "glute_bridge_pelvic_tilt",
    name: "Glute Bridge with Pelvic Tilt",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["pelvic_floor", "lower_back", "hips_glutes"],
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Pelvic Floor"],
    description: "Aligns pelvis, strengthens glutes, and takes compressive pressure off the lumbar spine.",
    instructions: [
      "Lie on back with knees bent, feet hip-width apart.",
      "Flatten lower back into the mat with a gentle posterior pelvic tilt.",
      "Drive through heels to lift hips until thighs and torso form a straight line.",
      "Squeeze glutes at top for 2 seconds, then lower with control."
    ]
  },
  {
    id: "dead_bugs",
    name: "Dead Bugs",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["pelvic_floor", "abs_core", "lower_back"],
    targetMuscles: ["Transverse Abdominis", "Obliques", "Multifidus"],
    description: "Diagonal core stabilization that trains abdominal bracing while maintaining a neutral spine.",
    instructions: [
      "Lie on back with arms pointing to ceiling and knees bent at 90 degrees.",
      "Press lower back firmly into floor.",
      "Slowly extend right arm overhead and left leg forward near floor.",
      "Return to center and alternate with opposite limbs."
    ]
  },
  {
    id: "clamshells_banded",
    name: "Clamshells",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["hips_glutes", "pelvic_floor", "knees"],
    targetMuscles: ["Gluteus Medius", "Deep Hip Rotators"],
    description: "Activates lateral hip stabilizers to prevent inward knee valgus and support pelvic alignment.",
    instructions: [
      "Lie on your side with hips stacked, knees bent at 90 degrees, and feet together.",
      "Keep feet touching and raise top knee as high as possible without rolling hips back.",
      "Hold peak contraction for 1 second.",
      "Slowly lower knee and repeat before switching sides."
    ]
  },
  {
    id: "cat_cow",
    name: "Cat-Cow Spinal Flow",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["lower_back", "upper_back_shoulders", "neck"],
    targetMuscles: ["Erector Spinae", "Multifidus", "Rectus Abdominis"],
    description: "Gentle spinal flexion and extension that hydrates spinal discs and relieves lower back stiffness.",
    instructions: [
      "Start on all fours with hands under shoulders and knees under hips.",
      "Inhale, arch back downward, lift chest and tailbone (Cow Pose).",
      "Exhale, tuck chin, round spine upward toward ceiling (Cat Pose).",
      "Move smoothly with deep breathing."
    ]
  },
  {
    id: "bird_dogs",
    name: "Bird Dogs",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["lower_back", "hips_glutes", "abs_core"],
    targetMuscles: ["Multifidus", "Gluteus Maximus", "Deltoids"],
    description: "A foundational rehab exercise to build spinal endurance and cross-body stabilization.",
    instructions: [
      "Begin on all fours with neutral spine.",
      "Reach right arm forward and left leg straight back simultaneously.",
      "Keep hips and shoulders level with the floor without arching back.",
      "Hold for 2 seconds, return smoothly, and alternate sides."
    ]
  },
  {
    id: "prone_press_ups",
    name: "Prone Press-Ups (McKenzie Extension)",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["lower_back"],
    targetMuscles: ["Lumbar Extensors", "Thoracic Spine"],
    description: "McKenzie extension protocol to relieve disc pressure, centralize sciatica, and restore lumbar lordosis.",
    instructions: [
      "Lie face down on mat with hands flat beneath shoulders.",
      "Relax your glutes and lower back completely.",
      "Press through hands to lift upper torso while keeping hips pinned to floor.",
      "Hold at the comfortable top stretch for 2 seconds, then lower down."
    ]
  },
  {
    id: "childs_pose_side_reach",
    name: "Child's Pose with Side Reach",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["lower_back", "upper_back_shoulders", "hips_glutes"],
    targetMuscles: ["Latissimus Dorsi", "Quadratus Lumborum", "Thoracolumbar Fascia"],
    description: "Gently decompresses the lumbar spine, opens lateral ribcage, and relieves lower back muscle spasms.",
    instructions: [
      "Kneel on mat with big toes touching and knees wide.",
      "Sit hips back onto heels and extend arms forward on the floor.",
      "Walk both hands over to the right side to stretch left lower back.",
      "Hold for deep breaths, then walk hands over to the left side."
    ]
  },
  {
    id: "wall_angels",
    name: "Wall Angels",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["upper_back_shoulders", "neck"],
    targetMuscles: ["Lower Trapezius", "Rhomboids", "Rotator Cuff"],
    description: "Corrects forward-head and rounded-shoulder posture by activating mid-back scapular retractors.",
    instructions: [
      "Stand with heels, glutes, upper back, and head resting against a wall.",
      "Bring elbows and back of hands flat against the wall at 90 degrees (goalpost arms).",
      "Slowly slide arms upward overhead while maintaining contact with the wall.",
      "Slide back down, squeezing shoulder blades together."
    ]
  },
  {
    id: "thoracic_book_openers",
    name: "Side-Lying Thoracic Book Openers",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["upper_back_shoulders", "chest", "neck"],
    targetMuscles: ["Thoracic Rotators", "Pectoralis Major", "Rhomboids"],
    description: "Unlocks mid-back rotational mobility to relieve neck stiffness and shoulder impingement.",
    instructions: [
      "Lie on side with knees bent at 90 degrees and arms extended straight out in front.",
      "Inhale and lift top arm up and over across body toward opposite floor.",
      "Follow your hand with your eyes, keeping knees glued together.",
      "Pause for a deep breath at maximum rotation, then close arms together."
    ]
  },
  {
    id: "ytw_raises",
    name: "Y-T-W Scapular Raises",
    category: "corrective",
    difficulty: "intermediate",
    bodyParts: ["upper_back_shoulders"],
    targetMuscles: ["Lower/Mid Trapezius", "Rear Deltoids", "Infraspinatus"],
    description: "Comprehensive scapular strengthening protocol to stabilize shoulder blades and prevent rotator cuff injuries.",
    instructions: [
      "Hinge forward at hips with flat back (or lie face down on mat).",
      "Form a 'Y' with arms thumbs pointing up, squeezing shoulder blades down and back.",
      "Move arms straight out to sides forming a 'T' with thumbs up.",
      "Bend elbows into a 'W' shape and pinch shoulder blades together tightly."
    ]
  },
  {
    id: "band_pull_aparts",
    name: "Scapular Retraction Pull-Aparts",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["upper_back_shoulders", "chest"],
    targetMuscles: ["Rhomboids", "Middle Trapezius", "Rear Deltoids"],
    description: "Strengthens upper back posture to counteract desk slump and computer slouch.",
    instructions: [
      "Stand tall holding imaginary or light resistance band at shoulder width.",
      "Keep arms straight and pull hands outward to sides until chest opens wide.",
      "Focus on pinching shoulder blades together.",
      "Control the return back to starting position."
    ]
  },
  {
    id: "chin_tucks",
    name: "Chin Tucks",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["neck", "upper_back_shoulders"],
    targetMuscles: ["Deep Cervical Flexors", "Longus Colli"],
    description: "Primary exercise for correcting 'tech neck' and relieving tension headaches and cervical strain.",
    instructions: [
      "Sit or stand tall with relaxed shoulders.",
      "Look straight ahead and gently draw chin straight backward (making a 'double chin').",
      "Feel a gentle elongation at the base of your skull without tilting head down.",
      "Hold for 3-5 seconds, relax, and repeat."
    ]
  },
  {
    id: "lateral_neck_stretch",
    name: "Gentle Lateral Neck Stretch",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["neck"],
    targetMuscles: ["Upper Trapezius", "Scalenes", "Sternocleidomastoid"],
    description: "Safely releases chronic muscle tension and tightness along the sides of the neck.",
    instructions: [
      "Sit upright and anchor right hand under your chair.",
      "Gently tilt left ear toward left shoulder without forcing.",
      "Use left hand for light guidance if comfortable.",
      "Breathe deeply for 20-30 seconds, then switch sides."
    ]
  },
  {
    id: "isometric_neck_press",
    name: "Isometric Neck Resistance Holds",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["neck"],
    targetMuscles: ["Cervical Stabilizers", "Splenius Capitis"],
    description: "Builds multi-directional neck stability and resilience without painful joint movement.",
    instructions: [
      "Place palm of hand against forehead.",
      "Gently press forehead into palm while resisting with hand so head does not move.",
      "Hold isometric pressure for 5 seconds.",
      "Repeat on sides of head and back of head."
    ]
  },
  {
    id: "tabletop_wrist_rocking",
    name: "Tabletop Wrist Rocking",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["wrists_hands", "elbows_forearms"],
    targetMuscles: ["Wrist Flexors", "Extensors", "Carpal Ligaments"],
    description: "Restores wrist extension and weight-bearing tolerance for pushups, yoga, and everyday lifting.",
    instructions: [
      "Start on hands and knees with fingers spread wide pointing forward.",
      "Gently rock body forward over wrists to feel a stretch in forearms.",
      "Rotate hands so fingers point sideways and rock side to side.",
      "Rotate hands so fingers point toward knees and gently sit hips back."
    ]
  },
  {
    id: "prayer_wrist_stretch",
    name: "Prayer & Reverse Prayer Stretch",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["wrists_hands", "elbows_forearms"],
    targetMuscles: ["Wrist Flexors", "Extensors"],
    description: "Alleviates typing strain, carpal tunnel tightness, and forearm fatigue.",
    instructions: [
      "Place palms together in front of chest with fingers pointing up (prayer position).",
      "Slowly lower hands downward while keeping palms pressed together.",
      "Hold for 15 seconds, then flip hands so backs of hands touch pointing down.",
      "Feel the gentle stretch across tops of wrists."
    ]
  },
  {
    id: "wrist_circles_rotations",
    name: "Wrist Circles & Tendon Glides",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["wrists_hands"],
    targetMuscles: ["Digital Flexors", "Extensors", "Lumbricals"],
    description: "Promotes lubricating synovial fluid flow and releases finger and wrist tendon stiffness.",
    instructions: [
      "Interlace fingers together in front of chest.",
      "Roll wrists in smooth continuous figure-8 patterns.",
      "Open hands wide spreading all fingers, then curl into tight fists.",
      "Perform smoothly in both directions."
    ]
  },
  {
    id: "forearm_pronation_supination",
    name: "Forearm Pronation & Supination",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["elbows_forearms", "wrists_hands"],
    targetMuscles: ["Pronator Teres", "Supinator", "Brachioradialis"],
    description: "Rehabilitates tennis elbow and golfer's elbow by strengthening rotational forearm tendons.",
    instructions: [
      "Sit with forearm resting flat on a table, elbow bent at 90 degrees.",
      "Hold a lightweight object or hammer by the base.",
      "Slowly rotate forearm outward so palm faces up (supination).",
      "Control the return, rotating forearm inward so palm faces down (pronation)."
    ]
  },
  {
    id: "eccentric_wrist_curls",
    name: "Eccentric Wrist Curls",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["elbows_forearms", "wrists_hands"],
    targetMuscles: ["Wrist Flexor/Extensor Tendons"],
    description: "Evidence-based eccentric loading for tendon recovery and pain relief in epicondylitis.",
    instructions: [
      "Rest forearm on thigh or table with hand hanging over edge palm down.",
      "Lift wrist up using opposite hand assistance.",
      "Slowly lower hand back down under self-control over 3-4 seconds.",
      "Repeat for 10-12 repetitions before switching to palm-up."
    ]
  },
  {
    id: "isometric_towel_squeeze",
    name: "Isometric Towel Squeeze",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["elbows_forearms", "wrists_hands"],
    targetMuscles: ["Deep Finger Flexors", "Forearm Stabilizers"],
    description: "Develops pain-free isometric grip endurance to stabilize the elbow joint.",
    instructions: [
      "Roll a hand towel into a firm cylinder.",
      "Grip towel firmly with both hands.",
      "Squeeze as tightly as comfortably possible without pain for 5-10 seconds.",
      "Release slowly, rest 5 seconds, and repeat."
    ]
  },
  {
    id: "hip_90_90_flow",
    name: "90/90 Hip Mobility Flow",
    category: "corrective",
    difficulty: "intermediate",
    bodyParts: ["hips_glutes", "lower_back"],
    targetMuscles: ["Hip Internal Rotators", "External Rotators", "Piriformis"],
    description: "Increases hip capsule internal and external rotation to protect the lower back and knees.",
    instructions: [
      "Sit on floor with lead leg bent at 90 degrees in front and trail leg bent at 90 degrees to side.",
      "Sit tall with proud chest and hinge gently over front shin.",
      "Hold for 10-15 seconds, then transition smoothly to opposite side without using hands if possible."
    ]
  },
  {
    id: "fire_hydrants",
    name: "Fire Hydrants",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["hips_glutes", "pelvic_floor"],
    targetMuscles: ["Gluteus Medius", "Gluteus Minimus", "TFL"],
    description: "Strengthens lateral hip abductors to improve pelvis stability during walking and running.",
    instructions: [
      "Start on all fours with hands under shoulders, knees under hips.",
      "Keeping knee bent at 90 degrees, raise one leg out to the side like a dog at a fire hydrant.",
      "Pause for 1 second at top without twisting lower back.",
      "Lower with control and complete reps before switching sides."
    ]
  },
  {
    id: "pigeon_stretch",
    name: "Elevated Pigeon Stretch",
    category: "corrective",
    difficulty: "beginner",
    bodyParts: ["hips_glutes", "lower_back"],
    targetMuscles: ["Piriformis", "Gluteus Maximus", "IT Band"],
    description: "Deep glute and piriformis stretch that eases sciatic nerve tension and improves hip mobility.",
    instructions: [
      "Place front shin across an elevated surface or yoga mat with knee at comfortable angle.",
      "Extend back leg straight behind you.",
      "Keep hips square and hinge forward from the hips with a flat back.",
      "Hold for 30-45 seconds while taking deep diaphragmatic breaths."
    ]
  },

  // ==========================================
  // CARDIO HIIT (10)
  // ==========================================
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    category: "cardio",
    difficulty: "beginner",
    bodyParts: ["ankle_feet", "knees", "upper_back_shoulders"],
    targetMuscles: ["Calves", "Deltoids", "Core"],
    description: "A classic aerobic full-body drill that elevates heart rate and improves dynamic coordination.",
    instructions: [
      "Stand upright with feet together and arms at your sides.",
      "Jump up, spreading feet wider than shoulder-width while raising arms overhead.",
      "Jump again to return to starting position.",
      "Repeat rhythmically at a steady pace."
    ]
  },
  {
    id: "high_knees",
    name: "High Knees",
    category: "cardio",
    difficulty: "intermediate",
    bodyParts: ["knees", "hips_glutes", "ankle_feet"],
    targetMuscles: ["Hip Flexors", "Quadriceps", "Calves"],
    description: "High-intensity running in place to build explosive hip drive, foot speed, and cardio stamina.",
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Drive one knee up toward your chest as high as possible.",
      "Quickly alternate legs at a running pace.",
      "Pump your arms in rhythm with knees."
    ]
  },
  {
    id: "butt_kicks",
    name: "Butt Kicks",
    category: "cardio",
    difficulty: "beginner",
    bodyParts: ["knees", "ankle_feet"],
    targetMuscles: ["Hamstrings", "Quadriceps", "Calves"],
    description: "Fast-paced running drill that stretches the quads and primes the hamstrings for sprint mechanics.",
    instructions: [
      "Stand with feet hip-width apart.",
      "Jog in place while kicking your heels up toward your glutes.",
      "Keep your chest upright and shoulders relaxed.",
      "Maintain a quick, bouncy rhythm."
    ]
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    category: "cardio",
    difficulty: "intermediate",
    bodyParts: ["abs_core", "upper_back_shoulders", "hips_glutes"],
    targetMuscles: ["Rectus Abdominis", "Shoulders", "Hip Flexors"],
    description: "Plank-based cardio sprint that challenges core endurance and shoulder stability.",
    instructions: [
      "Begin in a high plank position.",
      "Drive one knee toward chest, then return.",
      "Quickly alternate driving opposite knees forward.",
      "Maintain a flat back and active pace."
    ]
  },
  {
    id: "skater_jumps",
    name: "Skater Jumps",
    category: "cardio",
    difficulty: "intermediate",
    bodyParts: ["knees", "ankle_feet", "hips_glutes"],
    targetMuscles: ["Gluteus Medius", "Quadriceps", "Calves"],
    description: "Lateral bounding exercise that develops single-leg lateral power, balance, and ankle stability.",
    instructions: [
      "Bound laterally to the right, landing softly on your right foot.",
      "Sweep your left foot behind right ankle.",
      "Immediately spring off right foot to leap laterally to left side.",
      "Swing arms rhythmically to assist momentum."
    ]
  },
  {
    id: "burpees",
    name: "Burpees",
    category: "cardio",
    difficulty: "advanced",
    bodyParts: ["chest", "knees", "abs_core", "upper_back_shoulders"],
    targetMuscles: ["Chest", "Quadriceps", "Core", "Shoulders"],
    description: "Full-body metabolic conditioning drill that spikes cardiovascular output and athletic power.",
    instructions: [
      "From standing, drop into a squat and place hands on floor.",
      "Jump feet back into a plank position and perform a push-up.",
      "Jump feet back to hands and explosively leap into air with arms overhead."
    ]
  },
  {
    id: "shadow_boxing",
    name: "Shadow Boxing",
    category: "cardio",
    difficulty: "beginner",
    bodyParts: ["arms", "upper_back_shoulders", "abs_core"],
    targetMuscles: ["Deltoids", "Obliques", "Biceps", "Triceps"],
    description: "Low-impact dynamic boxing combinations that improve hand speed, rotational power, and stamina.",
    instructions: [
      "Stand in athletic staggered stance with hands guarding face.",
      "Throw alternating jabs, crosses, hooks, and uppercuts into air.",
      "Rotate through hips and core with each punch while staying light on feet."
    ]
  },
  {
    id: "lateral_shuffles",
    name: "Lateral Shuffles",
    category: "cardio",
    difficulty: "beginner",
    bodyParts: ["knees", "hips_glutes", "ankle_feet"],
    targetMuscles: ["Abductors", "Adductors", "Quadriceps"],
    description: "Defensive slide drill that activates hip adductors/abductors and improves agility.",
    instructions: [
      "Lower into athletic quarter-squat position.",
      "Quickly shuffle 4-5 steps to the right without crossing feet.",
      "Touch floor with right hand, then rapidly shuffle to the left."
    ]
  },
  {
    id: "star_jumps",
    name: "Star Jumps",
    category: "cardio",
    difficulty: "advanced",
    bodyParts: ["knees", "ankle_feet", "upper_back_shoulders"],
    targetMuscles: ["Quadriceps", "Calves", "Deltoids"],
    description: "Explosive plyometric leap expanding arms and legs into an X shape mid-air.",
    instructions: [
      "Crouch into low squat with arms tucked near feet.",
      "Explode upward, opening arms and legs outward like a star in mid-air.",
      "Land softly back into crouching starting position."
    ]
  },
  {
    id: "jump_rope_sim",
    name: "Invisible Jump Rope",
    category: "cardio",
    difficulty: "beginner",
    bodyParts: ["ankle_feet", "knees", "wrists_hands"],
    targetMuscles: ["Calves", "Forearms", "Cardiovascular"],
    description: "Low-impact bounce drill that develops ankle elasticity, wrist rhythm, and continuous aerobic conditioning.",
    instructions: [
      "Simulate holding a jump rope handle in each hand.",
      "Bounce lightly on balls of feet while rotating wrists in small circles.",
      "Keep jumps low (1-2 inches) with soft knee landings."
    ]
  },

  // ==========================================
  // UPPER BODY (10)
  // ==========================================
  {
    id: "push_ups",
    name: "Push-Ups",
    category: "upper",
    difficulty: "intermediate",
    bodyParts: ["chest", "arms", "upper_back_shoulders", "abs_core"],
    targetMuscles: ["Pectoralis Major", "Triceps", "Anterior Deltoids"],
    description: "The gold standard upper-body pressing movement for chest, shoulders, triceps, and core bracing.",
    instructions: [
      "Place hands slightly wider than shoulder-width, body in rigid straight line.",
      "Lower chest until it hovers 1 inch above floor, keeping elbows at 45 degrees.",
      "Push forcefully back up to full extension."
    ]
  },
  {
    id: "diamond_push_ups",
    name: "Diamond Push-Ups",
    category: "upper",
    difficulty: "advanced",
    bodyParts: ["arms", "chest", "elbows_forearms"],
    targetMuscles: ["Triceps Brachii", "Inner Chest", "Shoulders"],
    description: "Close-grip push-up variation focusing maximum mechanical tension on the triceps.",
    instructions: [
      "Place thumbs and index fingers touching to form a diamond shape under chest.",
      "Lower chest to touch hands, keeping elbows close to ribcage.",
      "Press through palms to full lockout."
    ]
  },
  {
    id: "decline_push_ups",
    name: "Decline Push-Ups",
    category: "upper",
    difficulty: "advanced",
    bodyParts: ["chest", "upper_back_shoulders", "arms"],
    targetMuscles: ["Clavicular Pectorals", "Deltoids", "Triceps"],
    description: "Elevated-foot push-up that targets the upper chest and anterior shoulder complex.",
    instructions: [
      "Elevate feet on a sturdy chair, sofa, or step with hands on floor.",
      "Lower chest to floor while maintaining tight core.",
      "Press back up smoothly."
    ]
  },
  {
    id: "pike_push_ups",
    name: "Pike Push-Ups",
    category: "upper",
    difficulty: "intermediate",
    bodyParts: ["upper_back_shoulders", "arms"],
    targetMuscles: ["Deltoids", "Upper Trapezius", "Triceps"],
    description: "Bodyweight overhead press simulation that builds overhead shoulder strength.",
    instructions: [
      "From downward dog position with hips high, look between feet.",
      "Bend elbows to lower crown of head toward floor in front of hands.",
      "Press through palms to push back up into pike."
    ]
  },
  {
    id: "dips_chair",
    name: "Chair / Bench Dips",
    category: "upper",
    difficulty: "beginner",
    bodyParts: ["arms", "chest", "upper_back_shoulders"],
    targetMuscles: ["Triceps", "Anterior Deltoids"],
    description: "Effective triceps isolation exercise using a chair or bench edge.",
    instructions: [
      "Sit on edge of chair, grip edge next to hips.",
      "Slide hips off edge, bend elbows to 90 degrees lowering body.",
      "Press through palms to extend arms straight."
    ]
  },
  {
    id: "arm_circles",
    name: "Arm Circles",
    category: "upper",
    difficulty: "beginner",
    bodyParts: ["upper_back_shoulders", "neck"],
    targetMuscles: ["Deltoids", "Rotator Cuff"],
    description: "Shoulder endurance and warm-up drill to activate deltoids and lubricate the glenohumeral joint.",
    instructions: [
      "Extend arms straight out to sides at shoulder height.",
      "Make small, controlled forward circles for 15 seconds.",
      "Reverse direction and make backward circles for 15 seconds."
    ]
  },
  {
    id: "doorframe_rows",
    name: "Doorframe Rows",
    category: "upper",
    difficulty: "beginner",
    bodyParts: ["upper_back_shoulders", "arms"],
    targetMuscles: ["Rhomboids", "Latissimus Dorsi", "Biceps"],
    description: "Bodyweight pulling movement utilizing a sturdy doorframe to strengthen the upper back and biceps.",
    instructions: [
      "Grip edge of sturdy doorframe with one or both hands, toes near base.",
      "Lean torso back with straight arms.",
      "Pull chest firmly toward doorframe, squeezing shoulder blades together."
    ]
  },
  {
    id: "superman_pulls",
    name: "Superman Lat Pulls",
    category: "upper",
    difficulty: "intermediate",
    bodyParts: ["upper_back_shoulders", "lower_back"],
    targetMuscles: ["Latissimus Dorsi", "Erector Spinae", "Rhomboids"],
    description: "Prone posterior chain exercise strengthening upper back lats and spinal extensors.",
    instructions: [
      "Lie face down with arms extended overhead and feet slightly lifted.",
      "Lift chest off mat, pull elbows back toward hips, pinching shoulder blades.",
      "Extend arms forward again with control."
    ]
  },
  {
    id: "plank_shoulder_taps",
    name: "Plank Shoulder Taps",
    category: "upper",
    difficulty: "intermediate",
    bodyParts: ["upper_back_shoulders", "abs_core", "wrists_hands"],
    targetMuscles: ["Deltoids", "Anti-Rotational Core", "Serratus"],
    description: "Anti-rotational stability drill reinforcing shoulder joint stability and core bracing.",
    instructions: [
      "Hold high plank with feet slightly wider than hips.",
      "Tap left shoulder with right hand without swaying hips.",
      "Return hand to floor and alternate sides."
    ]
  },
  {
    id: "inchworm",
    name: "Inchworm Walkouts",
    category: "upper",
    difficulty: "intermediate",
    bodyParts: ["upper_back_shoulders", "wrists_hands", "hips_glutes"],
    targetMuscles: ["Shoulders", "Core", "Hamstring Flexibility"],
    description: "Dynamic mobility and shoulder loading movement stretching hamstrings while strengthening shoulders.",
    instructions: [
      "From standing, hinge at waist, touch hands to floor.",
      "Walk hands forward into high plank position.",
      "Walk hands back to feet and stand tall."
    ]
  },

  // ==========================================
  // LOWER BODY (10)
  // ==========================================
  {
    id: "bodyweight_squats",
    name: "Bodyweight Squats",
    category: "lower",
    difficulty: "beginner",
    bodyParts: ["knees", "hips_glutes", "ankle_feet"],
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings"],
    description: "The fundamental lower-body movement pattern building leg strength and hip/knee mobility.",
    instructions: [
      "Stand with feet shoulder-width apart, toes turned slightly out.",
      "Hinge hips back and bend knees, lowering thighs parallel to floor.",
      "Drive through heels to stand tall, squeezing glutes at top."
    ]
  },
  {
    id: "jump_squats",
    name: "Jump Squats",
    category: "lower",
    difficulty: "advanced",
    bodyParts: ["knees", "ankle_feet", "hips_glutes"],
    targetMuscles: ["Quadriceps", "Calves", "Glutes"],
    description: "High-power plyometric squat building vertical leap, athletic power, and leg endurance.",
    instructions: [
      "Drop into a quarter to half squat.",
      "Explosively leap straight up, reaching for ceiling.",
      "Absorb landing softly back into squat."
    ]
  },
  {
    id: "walking_lunges",
    name: "Walking Lunges",
    category: "lower",
    difficulty: "intermediate",
    bodyParts: ["knees", "hips_glutes", "ankle_feet"],
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    description: "Dynamic unilateral leg drill improving balance, stride length, and quadriceps control.",
    instructions: [
      "Step forward with right leg, lowering back knee toward floor.",
      "Keep front knee tracking over ankle at 90 degrees.",
      "Push through right heel to step forward into next lunge with left leg."
    ]
  },
  {
    id: "reverse_lunges",
    name: "Reverse Lunges",
    category: "lower",
    difficulty: "beginner",
    bodyParts: ["knees", "hips_glutes"],
    targetMuscles: ["Glutes", "Hamstrings", "Quadriceps"],
    description: "Knee-friendly lunge variation minimizing shearing forces on the front kneecap.",
    instructions: [
      "Step backward with one foot and lower back knee until front thigh is parallel.",
      "Drive through front heel to step back to starting stance.",
      "Alternate sides with each rep."
    ]
  },
  {
    id: "glute_bridges",
    name: "Glute Bridges",
    category: "lower",
    difficulty: "beginner",
    bodyParts: ["hips_glutes", "lower_back"],
    targetMuscles: ["Gluteus Maximus", "Hamstrings"],
    description: "Floor-based hip extension that activates glutes and unloads the lower back.",
    instructions: [
      "Lie on back with knees bent, feet flat on floor hip-width apart.",
      "Drive through heels to lift hips upward toward ceiling.",
      "Squeeze glutes tightly at top, then lower with control."
    ]
  },
  {
    id: "single_leg_bridges",
    name: "Single-Leg Glute Bridges",
    category: "lower",
    difficulty: "intermediate",
    bodyParts: ["hips_glutes", "lower_back", "knees"],
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Core"],
    description: "Unilateral hip extension correcting strength imbalances between left and right glutes.",
    instructions: [
      "Lie on back, extend one leg straight in the air.",
      "Drive through working heel on floor to lift hips.",
      "Pause for 1 second, lower down and complete reps before switching legs."
    ]
  },
  {
    id: "calf_raises",
    name: "Calf Raises",
    category: "lower",
    difficulty: "beginner",
    bodyParts: ["ankle_feet"],
    targetMuscles: ["Gastrocnemius", "Soleus"],
    description: "Isolates calf muscles for ankle stiffness, plantarflexion power, and injury resistance.",
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Press through balls of feet to raise heels as high as possible.",
      "Pause at top, then slowly lower heels back to floor."
    ]
  },
  {
    id: "sumo_squats",
    name: "Sumo Squats",
    category: "lower",
    difficulty: "beginner",
    bodyParts: ["hips_glutes", "knees"],
    targetMuscles: ["Adductors (Inner Thighs)", "Glutes", "Quads"],
    description: "Wide-stance squat variation placing greater emphasis on inner thighs and glutes.",
    instructions: [
      "Set feet wider than shoulder-width with toes flared out 45 degrees.",
      "Lower hips straight down, pushing knees wide in line with toes.",
      "Squeeze inner thighs and glutes to stand."
    ]
  },
  {
    id: "wall_sit",
    name: "Wall Sit",
    category: "lower",
    difficulty: "intermediate",
    bodyParts: ["knees", "hips_glutes"],
    targetMuscles: ["Quadriceps", "Glutes", "Core"],
    description: "Isometric quadriceps burner that develops muscular endurance without joint impact.",
    instructions: [
      "Lean back against wall and slide down until thighs are parallel to floor.",
      "Keep knees at 90 degrees above ankles.",
      "Hold position steady for prescribed interval."
    ]
  },
  {
    id: "curtsy_lunges",
    name: "Curtsy Lunges",
    category: "lower",
    difficulty: "intermediate",
    bodyParts: ["hips_glutes", "knees"],
    targetMuscles: ["Gluteus Medius", "Quadriceps", "Adductors"],
    description: "Rotational lunge targeting the outer glutes and enhancing multi-planar hip stability.",
    instructions: [
      "Step left foot back diagonally behind right leg, bending both knees into a curtsy.",
      "Keep hips facing forward.",
      "Push off right heel to return to center and alternate."
    ]
  },

  // ==========================================
  // ABS & CORE (10)
  // ==========================================
  {
    id: "plank",
    name: "Forearm Plank",
    category: "abs",
    difficulty: "beginner",
    bodyParts: ["abs_core", "lower_back", "upper_back_shoulders"],
    targetMuscles: ["Transverse Abdominis", "Rectus Abdominis", "Shoulders"],
    description: "Isometric core powerhouse strengthening the deep abdominal wall and stabilizing the lumbar spine.",
    instructions: [
      "Rest on forearms and toes with elbows directly below shoulders.",
      "Maintain straight line from head to heels without sagging hips.",
      "Brace abs as if preparing for a punch."
    ]
  },
  {
    id: "side_plank",
    name: "Side Plank",
    category: "abs",
    difficulty: "intermediate",
    bodyParts: ["abs_core", "hips_glutes", "upper_back_shoulders"],
    targetMuscles: ["Internal/External Obliques", "Quadratus Lumborum"],
    description: "Lateral core brace that protects the spine from lateral shear forces.",
    instructions: [
      "Lie on side supported by forearm with feet stacked.",
      "Lift hips off mat until body forms straight diagonal line.",
      "Hold steady while keeping chest open."
    ]
  },
  {
    id: "bicycle_crunches",
    name: "Bicycle Crunches",
    category: "abs",
    difficulty: "intermediate",
    bodyParts: ["abs_core"],
    targetMuscles: ["Obliques", "Rectus Abdominis"],
    description: "Rotational abdominal crunch proven to maximize oblique and rectus abdominis recruitment.",
    instructions: [
      "Lie on back with hands behind head, legs in tabletop.",
      "Bring right elbow toward left knee while extending right leg straight.",
      "Switch smoothly to bring left elbow toward right knee."
    ]
  },
  {
    id: "flutter_kicks",
    name: "Flutter Kicks",
    category: "abs",
    difficulty: "intermediate",
    bodyParts: ["abs_core", "hips_glutes"],
    targetMuscles: ["Lower Abs", "Hip Flexors"],
    description: "Continuous leg flutters challenging lower abdominal endurance and anterior core tension.",
    instructions: [
      "Lie on back with hands under glutes for lower back support.",
      "Lift feet 6 inches off floor, toes pointed.",
      "Make small, rapid up-and-down scissor kicks while keeping lower back flat."
    ]
  },
  {
    id: "russian_twists",
    name: "Russian Twists",
    category: "abs",
    difficulty: "intermediate",
    bodyParts: ["abs_core"],
    targetMuscles: ["Obliques", "Transverse Abdominis"],
    description: "Rotational core exercise building dynamic rotational strength and waist control.",
    instructions: [
      "Sit on floor with knees bent, lean back 45 degrees into V-sit.",
      "Rotate torso from side to side, tapping hands on floor next to hips."
    ]
  },
  {
    id: "leg_raises",
    name: "Lying Leg Raises",
    category: "abs",
    difficulty: "advanced",
    bodyParts: ["abs_core", "hips_glutes", "lower_back"],
    targetMuscles: ["Lower Rectus Abdominis", "Hip Flexors"],
    description: "Challenging leg lever exercise building lower abdominal control and anti-extension strength.",
    instructions: [
      "Lie flat on back with legs straight, hands at sides.",
      "Keeping legs straight, lift them toward ceiling until hips reach 90 degrees.",
      "Slowly lower legs back down without letting lower back arch off floor."
    ]
  },
  {
    id: "hollow_body_hold",
    name: "Hollow Body Hold",
    category: "abs",
    difficulty: "advanced",
    bodyParts: ["abs_core", "lower_back"],
    targetMuscles: ["Total Abdominal Wall", "Hip Flexors"],
    description: "Gymnastics foundational shape developing full-body core tension and lumbar protection.",
    instructions: [
      "Lie on back, press lumbar spine flat into mat.",
      "Simultaneously lift shoulder blades and straight legs a few inches off floor.",
      "Reach arms overhead and hold rigid banana shape."
    ]
  },
  {
    id: "bear_crawl_hold",
    name: "Bear Crawl Hold",
    category: "abs",
    difficulty: "intermediate",
    bodyParts: ["abs_core", "upper_back_shoulders", "knees"],
    targetMuscles: ["Deep Core", "Serratus", "Quads"],
    description: "Quadruped hover requiring anti-extension and anti-rotation stability throughout the kinetic chain.",
    instructions: [
      "Start on all fours with hands under shoulders and knees under hips.",
      "Tuck toes and hover knees just 1-2 inches above the mat.",
      "Keep back flat as a tabletop and hold steady."
    ]
  },
  {
    id: "crunches",
    name: "Classic Crunches",
    category: "abs",
    difficulty: "beginner",
    bodyParts: ["abs_core"],
    targetMuscles: ["Rectus Abdominis"],
    description: "Controlled spinal flexion exercise isolating the upper fibers of the rectus abdominis.",
    instructions: [
      "Lie on back with knees bent, feet flat on floor.",
      "Place fingertips behind ears without pulling on neck.",
      "Curl upper shoulder blades off floor, squeezing ribs toward hips.",
      "Lower smoothly."
    ]
  },
  {
    id: "windshield_wipers",
    name: "Windshield Wipers",
    category: "abs",
    difficulty: "advanced",
    bodyParts: ["abs_core", "hips_glutes"],
    targetMuscles: ["Obliques", "Deep Core Rotators"],
    description: "High-level rotational core exercise sweeping straight legs side-to-side.",
    instructions: [
      "Lie on back with arms extended out to sides at T shape.",
      "Raise legs straight up toward ceiling.",
      "Lower legs slowly toward right side, pause, return to center, then lower to left."
    ]
  }
];

/**
 * Returns a localized copy of an exercise.
 */
export function getLocalizedExercise(exercise: Exercise): Exercise {
  const instructions = t(`exercises.${exercise.id}.instructions`, { defaultValue: exercise.instructions });
  const description = t(`exercises.${exercise.id}.description`, { defaultValue: exercise.description || "" });

  return {
    ...exercise,
    name: t(`exercises.${exercise.id}.name`, { defaultValue: exercise.name }),
    description: typeof description === "string" && description.length > 0 ? description : exercise.description,
    instructions: Array.isArray(instructions) ? instructions : exercise.instructions,
  };
}

/**
 * Returns the full exercise catalog localized into the active locale.
 */
export function getLocalizedExerciseCatalog(): Exercise[] {
  return EXERCISE_CATALOG.map(getLocalizedExercise);
}

/**
 * Returns the localized category display name.
 */
export function getLocalizedCategoryName(category: string): string {
  return t(`exercises.categories.${category}`, { defaultValue: category });
}

/**
 * Returns the localized body part display name.
 */
export function getLocalizedBodyPartName(bodyPart: BodyPart): string {
  return t(`exercises.bodyParts.${bodyPart}`, { defaultValue: bodyPart });
}
