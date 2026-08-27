import { Exercise } from "../model/Exercise";
import { t } from "../i18n";

export const EXERCISE_CATALOG: Exercise[] = [
  // ==========================================
  // CARDIO HIIT (10)
  // ==========================================
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    category: "cardio",
    difficulty: "beginner",
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
    instructions: [
      "Stand on right foot and bound laterally to the left.",
      "Land on left foot, sweeping right leg behind you.",
      "Immediately bound back to the right.",
      "Swing your arms naturally to generate power."
    ]
  },
  {
    id: "tuck_jumps",
    name: "Tuck Jumps",
    category: "cardio",
    difficulty: "advanced",
    instructions: [
      "Stand with feet shoulder-width apart and knees slightly bent.",
      "Explode vertically off the ground as high as you can.",
      "Pull knees up tightly toward chest in mid-air.",
      "Land softly on the balls of your feet and reset immediately."
    ]
  },
  {
    id: "fast_feet",
    name: "Fast Feet",
    category: "cardio",
    difficulty: "beginner",
    instructions: [
      "Assume an athletic quarter-squat stance with feet wide.",
      "Patter your feet as rapidly as possible against the floor.",
      "Keep your weight centered over the balls of your feet.",
      "Stay low and keep core engaged."
    ]
  },
  {
    id: "shadow_boxing",
    name: "Shadow Boxing",
    category: "cardio",
    difficulty: "beginner",
    instructions: [
      "Adopt a boxer stance with hands up protecting chin.",
      "Throw alternating jab, cross, hook, and uppercut punches.",
      "Rotate through your hips and pivot on the balls of your feet.",
      "Breathe out sharply with each strike."
    ]
  },
  {
    id: "star_jumps",
    name: "Star Jumps",
    category: "cardio",
    difficulty: "advanced",
    instructions: [
      "Crouch into a low squat with arms tucked close.",
      "Explode into the air, spreading arms and legs wide into a star shape.",
      "Quickly bring limbs back together before landing.",
      "Absorb the landing softly back into a squat."
    ]
  },
  {
    id: "jog_in_place",
    name: "Jog in Place",
    category: "cardio",
    difficulty: "beginner",
    instructions: [
      "Stand with feet hip-width apart.",
      "Lift one foot off the ground, bringing knee slightly up, and pump opposite arm.",
      "Alternate feet in a steady, rhythmic jogging motion.",
      "Stay light on the balls of your feet."
    ]
  },

  // ==========================================
  // UPPER BODY (12)
  // ==========================================
  {
    id: "pushups",
    name: "Push-Ups",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Place hands on floor slightly wider than shoulder-width.",
      "Extend legs straight behind you, supporting weight on toes.",
      "Lower body until chest nearly touches the floor.",
      "Push yourself back up to starting position."
    ]
  },
  {
    id: "wide_grip_pushups",
    name: "Wide-Grip Push-Ups",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Place hands significantly wider than shoulder-width apart.",
      "Keep body in a rigid plank alignment from head to heels.",
      "Lower chest smoothly towards the floor.",
      "Press back up firmly through your chest."
    ]
  },
  {
    id: "close_grip_pushups",
    name: "Diamond Push-Ups",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Place hands under chest with index fingers and thumbs forming a diamond.",
      "Keep elbows tucked close to ribcage as you lower down.",
      "Focus tension on triceps and inner chest.",
      "Push back up to starting position."
    ]
  },
  {
    id: "pike_pushups",
    name: "Pike Pushups",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Start in a downward dog position with hips high.",
      "Bend your elbows to lower the top of your head toward the floor.",
      "Push through your shoulders to return to the starting position.",
      "Keep your core tight and neck neutral."
    ]
  },
  {
    id: "incline_pushups",
    name: "Incline Push-Ups",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Place hands elevated on a sturdy bench, chair, or step.",
      "Lower your chest until it approaches the elevated surface.",
      "Press back up through chest and triceps.",
      "Keep body in a straight plank posture."
    ]
  },
  {
    id: "decline_pushups",
    name: "Decline Push-Ups",
    category: "upper",
    difficulty: "advanced",
    instructions: [
      "Place feet elevated on a bench or sturdy platform with hands on the floor.",
      "Lower chest smoothly toward the floor.",
      "Press through your upper chest and shoulders to return to start.",
      "Maintain strict core engagement without sagging."
    ]
  },
  {
    id: "bench_dips",
    name: "Tricep Dips",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Sit on the edge of a chair or bench with hands next to hips.",
      "Slide hips forward off the edge, supporting weight on hands.",
      "Bend elbows to 90 degrees, lowering hips toward floor.",
      "Press through palms to lockout arms at the top."
    ]
  },
  {
    id: "arm_circles",
    name: "Arm Circles",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart and extend arms out parallel to floor.",
      "Make controlled circular motions with both arms.",
      "Keep shoulders relaxed and core gently engaged.",
      "Reverse direction halfway through."
    ]
  },
  {
    id: "shoulder_taps",
    name: "Plank Shoulder Taps",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Hold a high push-up plank with feet slightly wider than hips.",
      "Lift right hand and tap your left shoulder without rotating hips.",
      "Return right hand and tap right shoulder with left hand.",
      "Keep your pelvis perfectly still throughout."
    ]
  },
  {
    id: "inchworms",
    name: "Inchworms",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Stand tall, then bend at waist and touch hands to floor in front of feet.",
      "Walk hands forward one by one until you reach a high plank.",
      "Hold for one second, then walk hands back toward feet.",
      "Stand tall and repeat."
    ]
  },
  {
    id: "superman",
    name: "Superman",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Lie face down on the floor with arms extended overhead and legs straight.",
      "Simultaneously lift arms, chest, and legs off the floor.",
      "Squeeze glutes and lower back muscles at the peak.",
      "Hold briefly and lower down with control."
    ]
  },
  {
    id: "prone_ytw",
    name: "Prone Y-T-W Raises",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Lie face down with forehead resting gently on the floor.",
      "Raise arms in a 'Y' shape with thumbs up, squeezing upper back.",
      "Shift arms to a 'T' shape and repeat, then to a 'W' shape.",
      "Strengthens rear delts, rhomboids, and postural muscles."
    ]
  },

  // ==========================================
  // LOWER BODY & GLUTES (14)
  // ==========================================
  {
    id: "squats",
    name: "Air Squats",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart, toes pointing slightly out.",
      "Lower hips back and down as if sitting into a chair.",
      "Keep chest upright and knees tracking over toes.",
      "Drive through heels to return to standing."
    ]
  },
  {
    id: "sumo_squats",
    name: "Sumo Squats",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Take a wide stance with toes pointed out at a 45-degree angle.",
      "Lower hips straight down, keeping knees pushed outward.",
      "Feel engagement in inner thighs and glutes.",
      "Press through heels to rise back up."
    ]
  },
  {
    id: "squat_jumps",
    name: "Squat Jumps",
    category: "lower",
    difficulty: "advanced",
    instructions: [
      "Lower into a standard squat position.",
      "Explode upwards into a vertical jump reaching overhead.",
      "Land softly on the balls of your feet and sink back into a squat.",
      "Repeat with continuous explosive rhythm."
    ]
  },
  {
    id: "lunges",
    name: "Alternating Forward Lunges",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Step forward with one leg and lower hips until both knees bend at 90 degrees.",
      "Keep front knee aligned above ankle.",
      "Push off front foot to return to standing and switch sides."
    ]
  },
  {
    id: "reverse_lunges",
    name: "Reverse Lunges",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand upright, then step one foot backward.",
      "Lower back knee smoothly toward the floor.",
      "Keep front shin vertical and weight centered in front heel.",
      "Drive through front heel to step forward."
    ]
  },
  {
    id: "side_lunges",
    name: "Lateral Side Lunges",
    category: "lower",
    difficulty: "intermediate",
    instructions: [
      "Take a large step out to the right side.",
      "Sit hips back into right heel while keeping left leg completely straight.",
      "Keep chest tall and right foot flat.",
      "Push off right foot to return to center, then alternate."
    ]
  },
  {
    id: "curtsy_lunges",
    name: "Curtsy Lunges",
    category: "lower",
    difficulty: "intermediate",
    instructions: [
      "Step left leg back and across behind right leg as if curtsying.",
      "Lower hips until front thigh is nearly parallel to floor.",
      "Feel targeted activation in outer hip and glute.",
      "Push through front foot to return and switch sides."
    ]
  },
  {
    id: "glute_bridges",
    name: "Glute Bridges",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Lie on back with knees bent and feet flat on floor hip-width apart.",
      "Drive through heels to lift hips until thighs and torso align.",
      "Squeeze glutes tightly at the top.",
      "Lower hips back down with control."
    ]
  },
  {
    id: "single_leg_bridge",
    name: "Single-Leg Glute Bridge",
    category: "lower",
    difficulty: "intermediate",
    instructions: [
      "Lie on back, lift one leg straight up into the air.",
      "Drive through the supporting heel to lift hips toward ceiling.",
      "Keep pelvis level and squeeze glute at the peak.",
      "Lower down slowly and repeat before switching legs."
    ]
  },
  {
    id: "wall_sit",
    name: "Wall Sit",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Lean flat against a wall and slide down until thighs are parallel to floor.",
      "Ensure knees are directly above ankles at a 90-degree angle.",
      "Keep back flat against wall and hold position.",
      "Breathe steadily throughout the hold."
    ]
  },
  {
    id: "calf_raises",
    name: "Calf Raises",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand upright with feet hip-width apart.",
      "Raise heels off the floor by pressing through the balls of both feet.",
      "Hold peak contraction for a second.",
      "Lower heels slowly back to the ground."
    ]
  },
  {
    id: "donkey_kicks",
    name: "Donkey Kicks",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Start on all fours with hands under shoulders and knees under hips.",
      "Keeping knee bent at 90 degrees, kick one heel up toward ceiling.",
      "Squeeze glute at top without arching lower back.",
      "Lower knee with control and alternate sides."
    ]
  },
  {
    id: "fire_hydrants",
    name: "Fire Hydrants",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Begin on all fours on a comfortable mat.",
      "Keeping knee bent, raise one leg out to the side like a dog at a hydrant.",
      "Target outer gluteus medius and hip abductors.",
      "Lower slowly and repeat."
    ]
  },
  {
    id: "single_leg_rdl",
    name: "Single-Leg Romanian Deadlift",
    category: "lower",
    difficulty: "intermediate",
    instructions: [
      "Stand on one leg with supporting knee slightly unlocked.",
      "Hinge forward at hips, extending opposite leg straight behind you.",
      "Keep back flat and hips square to floor.",
      "Drive through standing heel and glute to stand tall."
    ]
  },

  // ==========================================
  // CORE & ABS (14)
  // ==========================================
  {
    id: "plank",
    name: "Forearm Plank",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Place forearms on floor with elbows aligned under shoulders.",
      "Extend body in a straight line from head to heels.",
      "Engage core, glutes, and thighs.",
      "Hold position steadily without letting hips sag."
    ]
  },
  {
    id: "high_plank",
    name: "High Plank Hold",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Set hands directly beneath shoulders with fingers spread.",
      "Step feet back into a full push-up position.",
      "Press floor away actively to engage shoulder stabilizers.",
      "Keep core locked and spine neutral."
    ]
  },
  {
    id: "side_plank",
    name: "Side Plank",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Lie on your side with forearm flat and feet stacked.",
      "Lift hips off floor until body forms a straight diagonal line.",
      "Engage lower obliques and reach top arm upward.",
      "Hold without letting hips dip."
    ]
  },
  {
    id: "crunches",
    name: "Abdominal Crunches",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Lie on back with knees bent and feet flat on the floor.",
      "Place hands lightly behind your head.",
      "Engage abs and lift shoulder blades off the floor.",
      "Lower back down slowly, keeping tension in core."
    ]
  },
  {
    id: "bicycle_crunches",
    name: "Bicycle Crunches",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Lie on back with hands behind head and knees raised.",
      "Bring right elbow to left knee while extending right leg straight.",
      "Switch sides smoothly in a pedaling motion.",
      "Engage obliques on each rotation."
    ]
  },
  {
    id: "mason_twists",
    name: "Russian / Mason Twists",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Sit on floor with knees bent and feet elevated slightly.",
      "Clasp hands together and rotate torso from side to side.",
      "Touch floor on each side beside hips.",
      "Maintain a 45-degree backward torso lean."
    ]
  },
  {
    id: "leg_raises",
    name: "Lying Leg Raises",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Lie flat on your back with hands placed under lower back for support.",
      "Keep legs straight and raise them together until perpendicular to floor.",
      "Lower legs slowly without letting lower back arch off floor.",
      "Hover feet just above the floor before the next rep."
    ]
  },
  {
    id: "flutter_kicks",
    name: "Flutter Kicks",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Lie on back with lower spine pressed firmly to mat.",
      "Lift both legs a few inches off the floor.",
      "Alternate small, rapid kicking motions up and down.",
      "Keep abs locked tight throughout."
    ]
  },
  {
    id: "scissor_kicks",
    name: "Scissor Kicks",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Lie on back with legs extended a few inches above floor.",
      "Cross right ankle over left, then widen and cross left over right.",
      "Target lower abdominal wall and hip flexors.",
      "Maintain steady, calm breathing."
    ]
  },
  {
    id: "dead_bug",
    name: "Dead Bug",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Lie on back with arms pointing straight up and knees at 90 degrees.",
      "Simultaneously lower right arm overhead and left leg toward floor.",
      "Keep lower back glued to the floor.",
      "Return to start and repeat on opposite diagonal."
    ]
  },
  {
    id: "bird_dog",
    name: "Bird Dog",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Start on all fours on a padded surface.",
      "Simultaneously reach right arm forward and left leg straight back.",
      "Hold for a second, aligning limbs parallel to floor.",
      "Return with control and switch sides."
    ]
  },
  {
    id: "hollow_body_hold",
    name: "Hollow Body Hold",
    category: "abs",
    difficulty: "advanced",
    instructions: [
      "Lie flat on back with arms extended overhead.",
      "Simultaneously lift shoulders, arms, and straight legs off floor.",
      "Press lower back completely flat into the mat like a banana curve.",
      "Hold maximum core tension."
    ]
  },
  {
    id: "cross_body_climbers",
    name: "Cross-Body Mountain Climbers",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "In a high push-up position, drive right knee across toward left elbow.",
      "Return and immediately drive left knee across to right elbow.",
      "Engage rotational core strength and obliques.",
      "Maintain a strong, crisp rhythm."
    ]
  },
  {
    id: "plank_jacks",
    name: "Plank Jacks",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Hold a solid forearm or high plank position.",
      "Jump both feet outward wide, then jump them back together.",
      "Keep hips from bouncing excessively up and down.",
      "Combines core stability with cardiovascular demand."
    ]
  },

  // ==========================================
  // FULL BODY EXPLOSIVE (10)
  // ==========================================
  {
    id: "burpees",
    name: "Burpees",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "From standing, drop into a squat and place hands on floor.",
      "Kick feet back into plank position.",
      "Jump feet back toward hands.",
      "Explode up into a vertical jump reaching hands high."
    ]
  },
  {
    id: "bear_crawl",
    name: "Bear Crawl",
    category: "total",
    difficulty: "intermediate",
    instructions: [
      "Start on hands and knees with knees hovering 2 inches off floor.",
      "Crawl forward moving opposite hand and foot simultaneously.",
      "Keep back flat and hips level as you travel.",
      "Reverse direction or turn when needed."
    ]
  },
  {
    id: "crab_walk",
    name: "Crab Walk",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Sit on floor with knees bent, feet flat, and hands behind hips.",
      "Lift hips off ground and crawl backward or forward.",
      "Engages shoulders, triceps, glutes, and hamstrings.",
      "Keep hips elevated and core tight."
    ]
  },
  {
    id: "sprawls",
    name: "Sprawls",
    category: "total",
    difficulty: "intermediate",
    instructions: [
      "Stand in athletic stance, drop hands to floor and kick feet back wide.",
      "Snap hips forward quickly and jump back to standing athletic stance.",
      "Fast-paced wrestling and combat conditioning movement.",
      "Maintain brisk speed."
    ]
  },
  {
    id: "climber_pushup",
    name: "Mountain Climber to Push-Up",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "Perform 4 fast mountain climber knee drives in plank.",
      "Immediately execute one crisp, full push-up.",
      "Repeat the sequence continuously.",
      "Maximizes chest, shoulder, and cardio endurance."
    ]
  },
  {
    id: "squat_thrusts",
    name: "Squat Thrusts",
    category: "total",
    difficulty: "intermediate",
    instructions: [
      "Drop into a deep squat placing hands on floor.",
      "Kick feet back into a full plank position.",
      "Quickly jump feet forward back outside hands.",
      "Stand up tall and repeat."
    ]
  },
  {
    id: "plank_walkouts",
    name: "Plank Walkouts",
    category: "total",
    difficulty: "intermediate",
    instructions: [
      "From a high plank, take small steps with hands walking further forward.",
      "Reach as far forward as possible while keeping core from sagging.",
      "Walk hands back under shoulders.",
      "Deeply challenges abdominal wall and lats."
    ]
  },
  {
    id: "split_squat_jumps",
    name: "Jumping Split Lunges",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "Start in a lunge with left leg forward.",
      "Explode vertically off the ground and switch legs in mid-air.",
      "Land softly in a lunge with right leg forward.",
      "Repeat continuously with explosive power."
    ]
  },
  {
    id: "skater_to_hop",
    name: "Skater Hop to Vertical",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "Perform a wide lateral skater bound.",
      "Immediately jump straight up on the landing leg.",
      "Bound to the other side and repeat vertical hop.",
      "Develops lateral agility and vertical explosiveness."
    ]
  },
  {
    id: "burpee_tuck_jump",
    name: "Burpee to Tuck Jump",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "Complete a full chest-to-floor burpee.",
      "As you stand up, explode immediately into a high tuck jump.",
      "Pull knees to chest at peak height.",
      "Absorb landing and flow straight into the next burpee."
    ]
  },

  // ==========================================
  // MOBILITY & RECOVERY (10)
  // ==========================================
  {
    id: "left_leg_swings",
    name: "Left Leg Swings",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Stand tall holding a wall or steady object for balance.",
      "Swing left leg forward and backward in a smooth, continuous arc.",
      "Keep torso tall without excessive arching.",
      "Increase range of motion as muscles warm up."
    ]
  },
  {
    id: "right_leg_swings",
    name: "Right Leg Swings",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Stand tall holding a wall or steady object for balance.",
      "Swing right leg forward and backward in a smooth, continuous arc.",
      "Keep torso tall without excessive arching.",
      "Increase range of motion as muscles warm up."
    ]
  },
  {
    id: "left_arm_shoulder_stretch",
    name: "Shoulder Stretch (Left)",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Bring left arm across chest horizontally.",
      "Use right forearm to gently hug left arm closer to chest.",
      "Keep left shoulder relaxed down.",
      "Hold stretch while taking deep breaths."
    ]
  },
  {
    id: "right_arm_shoulder_stretch",
    name: "Shoulder Stretch (Right)",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Bring right arm across chest horizontally.",
      "Use left forearm to gently hug right arm closer to chest.",
      "Keep right shoulder relaxed down.",
      "Hold stretch while taking deep breaths."
    ]
  },
  {
    id: "left_arm_tricep_stretch",
    name: "Overhead Tricep Stretch (Left)",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Raise left elbow overhead, bending arm so hand reaches upper back.",
      "Gently press left elbow with right hand.",
      "Keep spine tall and chest open.",
      "Hold and breathe steadily."
    ]
  },
  {
    id: "right_arm_tricep_stretch",
    name: "Overhead Tricep Stretch (Right)",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Raise right elbow overhead, bending arm so hand reaches upper back.",
      "Gently press right elbow with left hand.",
      "Keep spine tall and chest open.",
      "Hold and breathe steadily."
    ]
  },
  {
    id: "seated_toe_touch",
    name: "Hamstring Toe Touch",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Sit on floor with legs extended straight in front.",
      "Hinge forward at hips and reach hands toward toes.",
      "Keep spine long and knees soft if needed.",
      "Hold stretch gently without bouncing."
    ]
  },
  {
    id: "cat_cow",
    name: "Cat Cow Mobility",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Start on all fours with wrists under shoulders and knees under hips.",
      "Inhale, arch back, dropping belly and lifting gaze (Cow).",
      "Exhale, round spine upward, tucking chin to chest (Cat).",
      "Flow smoothly between poses with your breath."
    ]
  },
  {
    id: "childs_pose",
    name: "Child's Pose",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Kneel on floor with big toes touching and knees wide apart.",
      "Sit hips back onto heels and walk hands forward on floor.",
      "Rest forehead gently on mat and extend arms long.",
      "Breathe deeply into back and relax shoulders."
    ]
  },
  {
    id: "cobra_pose",
    name: "Cobra / Upward Dog",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Lie face down, hands planted under shoulders.",
      "Gently press through hands to lift chest off floor.",
      "Keep shoulders down away from ears and open the chest.",
      "Stretches abdominal wall and strengthens spine."
    ]
  }
];

/**
 * Returns a localized copy of an exercise.
 */
export function getLocalizedExercise(exercise: Exercise): Exercise {
  const instructions = t(`exercises.${exercise.id}.instructions`, { defaultValue: exercise.instructions });
  return {
    ...exercise,
    name: t(`exercises.${exercise.id}.name`, { defaultValue: exercise.name }),
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
