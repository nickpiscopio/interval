import { Timer } from "../model/Timer";

export const DEFAULT_AI_TIMERS: Timer[] = [
  {
    id: "default_ai_1",
    name: "Couch to Comet 🚀",
    rounds: 3,
    isAiGenerated: true,
    createdAt: 1700000000005,
    intervals: [
      { id: "ai_1_int_1", name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" },
      { id: "ai_1_int_2", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_1_int_3", name: "Pushups", duration: 30, color: "#3B82F6", exerciseId: "pushups" },
      { id: "ai_1_int_4", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_1_int_5", name: "Air Squats", duration: 30, color: "#F59E0B", exerciseId: "squats" },
      { id: "ai_1_int_6", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_1_int_7", name: "Forearm Plank", duration: 30, color: "#8338EC", exerciseId: "plank" }
    ]
  },
  {
    id: "default_ai_2",
    name: "Abs-olutely Fabulous ✨",
    rounds: 4,
    isAiGenerated: true,
    createdAt: 1700000000004,
    intervals: [
      { id: "ai_2_int_1", name: "Forearm Plank", duration: 40, color: "#8338EC", exerciseId: "plank" },
      { id: "ai_2_int_2", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_2_int_3", name: "Abdominal Crunches", duration: 40, color: "#8338EC", exerciseId: "crunches" },
      { id: "ai_2_int_4", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_2_int_5", name: "Russian Twists", duration: 40, color: "#8338EC", exerciseId: "russian_twists" },
      { id: "ai_2_int_6", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_2_int_7", name: "Mountain Climbers", duration: 40, color: "#1ACC6C", exerciseId: "mountain_climbers" }
    ]
  },
  {
    id: "default_ai_3",
    name: "Sweaty Spaghetti 🍝",
    rounds: 3,
    isAiGenerated: true,
    createdAt: 1700000000003,
    intervals: [
      { id: "ai_3_int_1", name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" },
      { id: "ai_3_int_2", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_3_int_3", name: "Mountain Climbers", duration: 30, color: "#1ACC6C", exerciseId: "mountain_climbers" },
      { id: "ai_3_int_4", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_3_int_5", name: "Air Squats", duration: 30, color: "#F59E0B", exerciseId: "squats" },
      { id: "ai_3_int_6", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_3_int_7", name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" }
    ]
  },
  {
    id: "default_ai_4",
    name: "Biceps & Bagels 🥯",
    rounds: 4,
    isAiGenerated: true,
    createdAt: 1700000000002,
    intervals: [
      { id: "ai_4_int_1", name: "Pushups", duration: 40, color: "#3B82F6", exerciseId: "pushups" },
      { id: "ai_4_int_2", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_4_int_3", name: "Pike Pushups", duration: 40, color: "#3B82F6", exerciseId: "pike_pushups" },
      { id: "ai_4_int_4", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_4_int_5", name: "Forearm Plank", duration: 40, color: "#8338EC", exerciseId: "plank" },
      { id: "ai_4_int_6", name: "Rest", duration: 15, color: "#4B5563" },
      { id: "ai_4_int_7", name: "Pushups", duration: 40, color: "#3B82F6", exerciseId: "pushups" }
    ]
  },
  {
    id: "default_ai_5",
    name: "Gravity Who? 🌪️",
    rounds: 5,
    isAiGenerated: true,
    createdAt: 1700000000001,
    intervals: [
      { id: "ai_5_int_1", name: "Burpees", duration: 45, color: "#E63946", exerciseId: "burpees" },
      { id: "ai_5_int_2", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "ai_5_int_3", name: "Mountain Climbers", duration: 45, color: "#1ACC6C", exerciseId: "mountain_climbers" },
      { id: "ai_5_int_4", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "ai_5_int_5", name: "Alternating Lunges", duration: 45, color: "#F59E0B", exerciseId: "lunges" },
      { id: "ai_5_int_6", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "ai_5_int_7", name: "Pike Pushups", duration: 45, color: "#3B82F6", exerciseId: "pike_pushups" },
      { id: "ai_5_int_8", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "ai_5_int_9", name: "Russian Twists", duration: 45, color: "#8338EC", exerciseId: "russian_twists" }
    ]
  }
];
