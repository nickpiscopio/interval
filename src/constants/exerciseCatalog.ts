import { Exercise } from "../model/Exercise";
import { t } from "../i18n";

export const EXERCISE_CATALOG: Exercise[] = [
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    category: "cardio",
    difficulty: "beginner",
    instructions: [
      "Stand upright with your feet together and arms at your sides.",
      "Jump up, spreading your feet wider than shoulder-width while raising your arms above your head.",
      "Jump again to return to the starting position.",
      "Repeat rhythmically at a steady pace."
    ]
  },
  {
    id: "pushups",
    name: "Pushups",
    category: "upper",
    difficulty: "beginner",
    instructions: [
      "Place your hands on the floor slightly wider than shoulder-width.",
      "Extend your legs straight behind you, supporting weight on toes.",
      "Lower your body until your chest nearly touches the floor.",
      "Push yourself back up to the starting position."
    ]
  },
  {
    id: "squats",
    name: "Air Squats",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart, toes pointing slightly out.",
      "Lower your hips back and down as if sitting in a chair.",
      "Keep your chest upright and knees behind your toes.",
      "Drive through your heels to return to standing."
    ]
  },
  {
    id: "plank",
    name: "Forearm Plank",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Place your forearms on the floor, elbows aligned under shoulders.",
      "Extend your body in a straight line from head to heels.",
      "Engage your core, glutes, and thighs.",
      "Hold this position without letting your hips sag."
    ]
  },
  {
    id: "burpees",
    name: "Burpees",
    category: "total",
    difficulty: "advanced",
    instructions: [
      "Start in a standing position.",
      "Drop into a squat with hands on the ground.",
      "Kick your feet back into a pushup position.",
      "Immediately return your feet to the squat position.",
      "Jump up explosively, reaching hands overhead."
    ]
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    category: "cardio",
    difficulty: "intermediate",
    instructions: [
      "Begin in a high plank position.",
      "Drive one knee toward your chest, then return it.",
      "Immediately switch to drive the other knee forward.",
      "Keep your back flat and run your knees as fast as possible."
    ]
  },
  {
    id: "crunches",
    name: "Abdominal Crunches",
    category: "abs",
    difficulty: "beginner",
    instructions: [
      "Lie on your back with knees bent and feet flat on the floor.",
      "Place your hands lightly behind your head.",
      "Engage your abs and lift your shoulders off the floor.",
      "Lower back down slowly, keeping tension in your core."
    ]
  },
  {
    id: "lunges",
    name: "Alternating Lunges",
    category: "lower",
    difficulty: "beginner",
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Step forward with one leg and lower your hips.",
      "Both knees should bend at 90-degree angles.",
      "Push off your front foot to return to standing, then switch legs."
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
    id: "russian_twists",
    name: "Russian Twists",
    category: "abs",
    difficulty: "intermediate",
    instructions: [
      "Sit on the floor, bend your knees, and lean back slightly.",
      "Lift your feet off the floor and balance on your tailbone.",
      "Interlock your hands and twist your torso from side to side.",
      "Touch the ground beside your hip on each twist."
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
  return t(`exercises.categories.${category}`, { defaultValue: category.toUpperCase() });
}

