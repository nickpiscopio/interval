import { EXERCISE_CATALOG } from "../constants/exerciseCatalog";
import { Timer } from "../model/Timer";
import { Interval } from "../model/Interval";
import { Exercise } from "../model/Exercise";

export interface GeneratorParams {
  goal: "weight_loss" | "tone" | "bulk";
  area: "total" | "abs" | "lower" | "cardio" | "upper" | "surprise";
  experience: "beginner" | "intermediate" | "advanced";
}

export function generateWorkout(params: GeneratorParams): Timer {
  const { goal, area, experience } = params;

  // 1. Filter exercises by category (area)
  let filtered = EXERCISE_CATALOG;
  if (area !== "surprise") {
    filtered = EXERCISE_CATALOG.filter((ex) => ex.category === area);
  }

  // 2. Filter exercises by difficulty (incorporating fallbacks if pool is small)
  let matchingExercises = filtered.filter((ex) => ex.difficulty === experience);

  // Fallback chain if we don't have enough exercises
  if (matchingExercises.length < 3) {
    if (experience === "advanced") {
      matchingExercises = [
        ...matchingExercises,
        ...filtered.filter((ex) => ex.difficulty === "intermediate"),
        ...filtered.filter((ex) => ex.difficulty === "beginner")
      ];
    } else if (experience === "intermediate") {
      matchingExercises = [
        ...matchingExercises,
        ...filtered.filter((ex) => ex.difficulty === "beginner"),
        ...filtered.filter((ex) => ex.difficulty === "advanced")
      ];
    } else {
      matchingExercises = [
        ...matchingExercises,
        ...filtered.filter((ex) => ex.difficulty === "intermediate"),
        ...filtered.filter((ex) => ex.difficulty === "advanced")
      ];
    }
  }

  // Deduplicate exercises in case of merges
  matchingExercises = matchingExercises.filter(
    (ex, index, self) => self.findIndex((t) => t.id === ex.id) === index
  );

  // Shuffle selected exercises
  const shuffled = [...matchingExercises].sort(() => 0.5 - Math.random());

  // 3. Determine structure parameters based on experience
  let activeDuration = 30; // seconds
  let restDuration = 15; // seconds
  let rounds = 3;
  let workoutCount = 4; // number of exercises in the cycle

  if (experience === "intermediate") {
    activeDuration = 40;
    restDuration = 15;
    rounds = 4;
    workoutCount = 5;
  } else if (experience === "advanced") {
    activeDuration = 45;
    restDuration = 10;
    rounds = 5;
    workoutCount = 6;
  }

  // Pick up to workoutCount exercises
  const selectedExercises = shuffled.slice(0, Math.min(workoutCount, shuffled.length));

  // If we still have fewer than expected exercises, duplicate or loop them
  while (selectedExercises.length < workoutCount && selectedExercises.length > 0) {
    selectedExercises.push(selectedExercises[Math.floor(Math.random() * selectedExercises.length)]);
  }

  // 4. Construct colors and intervals list
  const intervals: Interval[] = [];
  const colorMap: Record<string, string> = {
    cardio: "#1ACC6C", // Active Green
    total: "#E63946",  // Vivid Red
    upper: "#3B82F6",  // Bright Blue
    lower: "#F59E0B",  // Orange/Amber
    abs: "#8338EC"     // Electric Purple
  };

  selectedExercises.forEach((ex, idx) => {
    // Add Active Exercise Interval
    intervals.push({
      name: ex.name,
      duration: activeDuration,
      color: colorMap[ex.category] || "#1ACC6C",
      exerciseId: ex.id
    });

    // Add Rest Interval (if it is not the very last interval of the loop)
    if (idx < selectedExercises.length - 1) {
      intervals.push({
        name: "Rest",
        duration: restDuration,
        color: "#4B5563" // Slate Gray
      });
    }
  });

  // 5. Generate motivating name
  const goalNames: Record<string, string> = {
    weight_loss: "Fat Burn",
    tone: "Tone & Sculpt",
    bulk: "Strength Boost"
  };

  const areaNames: Record<string, string> = {
    total: "Full Body",
    abs: "Core Focus",
    lower: "Lower Body",
    upper: "Upper Body",
    cardio: "HIIT Cardio",
    surprise: "Custom Blast"
  };

  const difficultyNames: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Int.",
    advanced: "Pro"
  };

  const timerName = `${difficultyNames[experience]} ${areaNames[area]} ${goalNames[goal]}`;

  return {
    id: `ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: timerName,
    rounds,
    intervals,
    createdAt: Date.now(),
    isAiGenerated: true
  };
}
