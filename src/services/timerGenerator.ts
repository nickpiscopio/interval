import { EXERCISE_CATALOG, getLocalizedExercise } from "../constants/exerciseCatalog";
import { Timer } from "../model/Timer";
import { Interval, generateIntervalId } from "../model/Interval";
import { Exercise } from "../model/Exercise";
import { t } from "../i18n";

export interface GeneratorParams {
  goal: "weight_loss" | "tone" | "bulk";
  area: "total" | "abs" | "lower" | "cardio" | "upper" | "surprise";
  experience: "beginner" | "intermediate" | "advanced";
}

/**
 * Intelligent client-side athletic rules engine.
 * Generates balanced, progressive bodyweight HIIT routines.
 */
export function generateWorkout(params: GeneratorParams): Timer {
  const { goal, area, experience } = params;

  // 1. Structure configuration by experience level
  let activeDuration = 30; // seconds
  let restDuration = 15;   // seconds
  let rounds = 3;
  let workoutCount = 4;    // exercises per circuit

  if (experience === "intermediate") {
    activeDuration = 40;
    restDuration = 15;
    rounds = 4;
    workoutCount = 5;
  } else if (experience === "advanced") {
    activeDuration = 45;
    restDuration = 15;
    rounds = 4;
    workoutCount = 6;
  }

  // 2. Select balanced exercises with Antagonist Sequencing
  const selectedExercises: Exercise[] = [];

  if (area === "total" || area === "surprise" || goal === "weight_loss") {
    // Balanced Antagonist Flow: Cardio -> Lower -> Upper -> Abs -> Explosive -> Lower
    const categoryFlow: Array<Exercise["category"]> = ["cardio", "lower", "upper", "abs", "total", "lower"];
    const usedIds = new Set<string>();

    for (let i = 0; i < workoutCount; i++) {
      const targetCat = categoryFlow[i % categoryFlow.length];
      const pool = EXERCISE_CATALOG.filter(
        (ex) => ex.category === targetCat && !usedIds.has(ex.id) && (ex.difficulty === experience || ex.difficulty === "beginner" || ex.difficulty === "intermediate")
      );

      const candidate = pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : EXERCISE_CATALOG.find((ex) => !usedIds.has(ex.id)) || EXERCISE_CATALOG[0];

      selectedExercises.push(candidate);
      usedIds.add(candidate.id);
    }
  } else {
    // Targeted focus area with difficulty matching
    const primaryPool = EXERCISE_CATALOG.filter((ex) => ex.category === area);
    const matchedDifficulty = primaryPool.filter((ex) => ex.difficulty === experience);
    const candidatePool = matchedDifficulty.length >= workoutCount ? matchedDifficulty : primaryPool;
    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(workoutCount, shuffled.length));

    selectedExercises.push(...picked);

    // Fallback if needed
    while (selectedExercises.length < workoutCount) {
      const fallback = EXERCISE_CATALOG[Math.floor(Math.random() * EXERCISE_CATALOG.length)];
      if (!selectedExercises.some((ex) => ex.id === fallback.id)) {
        selectedExercises.push(fallback);
      } else {
        selectedExercises.push(selectedExercises[0]);
        break;
      }
    }
  }

  // 3. Construct intervals list
  const intervals: Interval[] = [];
  const colorMap: Record<string, string> = {
    cardio: "#1ACC6C", // Emerald
    total: "#E63946",  // Red
    upper: "#3B82F6",  // Blue
    lower: "#F59E0B",  // Amber
    abs: "#8338EC"     // Purple
  };

  selectedExercises.forEach((rawEx, idx) => {
    const ex = getLocalizedExercise(rawEx);
    intervals.push({
      id: generateIntervalId(),
      name: ex.name,
      duration: activeDuration,
      color: colorMap[rawEx.category] || "#1ACC6C",
      exerciseId: rawEx.id
    });

    // Add rest interval between exercises
    if (idx < selectedExercises.length - 1) {
      intervals.push({
        id: generateIntervalId(),
        name: t("timerGenerator.rest", { defaultValue: "Rest" }),
        duration: restDuration,
        color: "#4B5563"
      });
    }
  });

  // 4. Generate motivating localized title
  const goalNames: Record<string, string> = {
    weight_loss: t("timerGenerator.goalWeightLoss", { defaultValue: "Fat Burn" }),
    toned: t("timerGenerator.goalTone", { defaultValue: "Tone & Sculpt" }),
    tone: t("timerGenerator.goalTone", { defaultValue: "Tone & Sculpt" }),
    bulk: t("timerGenerator.goalBulk", { defaultValue: "Strength Boost" })
  };

  const areaNames: Record<string, string> = {
    total: t("timerGenerator.areaTotal", { defaultValue: "Full Body" }),
    abs: t("timerGenerator.areaAbs", { defaultValue: "Core" }),
    lower: t("timerGenerator.areaLower", { defaultValue: "Legs & Glutes" }),
    upper: t("timerGenerator.areaUpper", { defaultValue: "Upper Body" }),
    cardio: t("timerGenerator.areaCardio", { defaultValue: "HIIT Cardio" }),
    surprise: t("timerGenerator.areaSurprise", { defaultValue: "Power Circuit" })
  };

  const difficultyNames: Record<string, string> = {
    beginner: t("timerGenerator.diffBeginner", { defaultValue: "Beginner" }),
    intermediate: t("timerGenerator.diffIntermediate", { defaultValue: "Int." }),
    advanced: t("timerGenerator.diffAdvanced", { defaultValue: "Pro" })
  };

  const timerName = t("timerGenerator.timerName", {
    difficulty: difficultyNames[experience],
    area: areaNames[area],
    goal: goalNames[goal],
    defaultValue: `${difficultyNames[experience]} ${areaNames[area]} ${goalNames[goal]}`
  });

  return {
    id: `ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: timerName,
    rounds,
    intervals,
    createdAt: Date.now(),
    isAiGenerated: true
  };
}
