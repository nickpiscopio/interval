export type BodyPart =
  | "ankle_feet"
  | "knees"
  | "pelvic_floor"
  | "lower_back"
  | "upper_back_shoulders"
  | "neck"
  | "wrists_hands"
  | "elbows_forearms"
  | "hips_glutes"
  | "chest"
  | "arms"
  | "abs_core";

export interface Exercise {
  id: string;
  name: string;
  videoUrl?: string;
  category: "total" | "abs" | "upper" | "lower" | "cardio" | "corrective";
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  description?: string;
  bodyParts?: BodyPart[];
  targetMuscles?: string[];
}
