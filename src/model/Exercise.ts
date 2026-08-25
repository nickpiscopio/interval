export interface Exercise {
  id: string;
  name: string;
  videoUrl?: string;
  category: "total" | "abs" | "upper" | "lower" | "cardio";
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
}
