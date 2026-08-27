import { Exercise } from "../model/Exercise";
import { t } from "../i18n";

export const EXERCISE_CATALOG: Exercise[] = [
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
  {
    id: "high_knees",
    name: "High Knees",
    category: "cardio",
    difficulty: "intermediate",
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Drive one knee up towards chest as high as possible.",
      "Quickly alternate legs at a running pace.",
      "Pump your arms in rhythm with knees."
    ]
  },
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
    name: "Close-Grip Push-Ups",
    category: "upper",
    difficulty: "intermediate",
    instructions: [
      "Place hands directly under chest with index fingers and thumbs close.",
      "Keep elbows tucked close to ribcage as you lower down.",
      "Focus tension on triceps and inner chest.",
      "Push back up to starting position."
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
    id: "squats",
    name: "Squats",
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
    name: "Lunges",
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
    id: "left_leg_swings",
    name: "Left Leg Swings",
    category: "lower",
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
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand tall holding a wall or steady object for balance.",
      "Swing right leg forward and backward in a smooth, continuous arc.",
      "Keep torso tall without excessive arching.",
      "Increase range of motion as muscles warm up."
    ]
  },
  {
    id: "left_side_leg_lifts",
    name: "Left Side Leg Lifts",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Lie on your right side with legs straight and stacked.",
      "Raise your left leg smoothly toward the ceiling without rotating hips.",
      "Squeeze outer hip and glute at top.",
      "Lower back down slowly."
    ]
  },
  {
    id: "right_side_leg_lifts",
    name: "Right Side Leg Lifts",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Lie on your left side with legs straight and stacked.",
      "Raise your right leg smoothly toward the ceiling without rotating hips.",
      "Squeeze outer hip and glute at top.",
      "Lower back down slowly."
    ]
  },
  {
    id: "plank",
    name: "Plank",
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
    name: "Mason Twists",
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
    id: "left_arm_shoulder_stretch",
    name: "Left Arm Shoulder Stretch",
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
    name: "Right Arm Shoulder Stretch",
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
    name: "Left Arm Tricep Stretch",
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
    name: "Right Arm Tricep Stretch",
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
    name: "Seated Toe Touch",
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
    name: "Cat Cow",
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
    id: "left_side_quad_stretch",
    name: "Left Side Quad Stretch",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Stand on right leg (or hold a wall for support).",
      "Bend left knee and grab left ankle behind glutes.",
      "Gently pull heel towards glutes while keeping knees together.",
      "Hold stretch feeling tension release in front thigh."
    ]
  },
  {
    id: "right_side_quad_stretch",
    name: "Right Side Quad Stretch",
    category: "total",
    difficulty: "beginner",
    instructions: [
      "Stand on left leg (or hold a wall for support).",
      "Bend right knee and grab right ankle behind glutes.",
      "Gently pull heel towards glutes while keeping knees together.",
      "Hold stretch feeling tension release in front thigh."
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
