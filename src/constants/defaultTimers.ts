import { Timer } from "../model/Timer";

export const DEFAULT_AI_TIMERS: Timer[] = [
  {
    id: "default_ai_1",
    name: "Couch to Comet 🚀",
    rounds: 3,
    isAiGenerated: true,
    createdAt: 1700000000005,
    intervals: [
      { name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Pushups", duration: 30, color: "#3B82F6", exerciseId: "pushups" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Air Squats", duration: 30, color: "#F59E0B", exerciseId: "squats" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Forearm Plank", duration: 30, color: "#8338EC", exerciseId: "plank" }
    ]
  },
  {
    id: "default_ai_2",
    name: "Abs-olutely Fabulous ✨",
    rounds: 4,
    isAiGenerated: true,
    createdAt: 1700000000004,
    intervals: [
      { name: "Forearm Plank", duration: 40, color: "#8338EC", exerciseId: "plank" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Abdominal Crunches", duration: 40, color: "#8338EC", exerciseId: "crunches" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Russian Twists", duration: 40, color: "#8338EC", exerciseId: "russian_twists" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Mountain Climbers", duration: 40, color: "#1ACC6C", exerciseId: "mountain_climbers" }
    ]
  },
  {
    id: "default_ai_3",
    name: "Sweaty Spaghetti 🍝",
    rounds: 3,
    isAiGenerated: true,
    createdAt: 1700000000003,
    intervals: [
      { name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Mountain Climbers", duration: 30, color: "#1ACC6C", exerciseId: "mountain_climbers" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Air Squats", duration: 30, color: "#F59E0B", exerciseId: "squats" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Jumping Jacks", duration: 30, color: "#1ACC6C", exerciseId: "jumping_jacks" }
    ]
  },
  {
    id: "default_ai_4",
    name: "Biceps & Bagels 🥯",
    rounds: 4,
    isAiGenerated: true,
    createdAt: 1700000000002,
    intervals: [
      { name: "Pushups", duration: 40, color: "#3B82F6", exerciseId: "pushups" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Pike Pushups", duration: 40, color: "#3B82F6", exerciseId: "pike_pushups" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Forearm Plank", duration: 40, color: "#8338EC", exerciseId: "plank" },
      { name: "Rest", duration: 15, color: "#4B5563" },
      { name: "Pushups", duration: 40, color: "#3B82F6", exerciseId: "pushups" }
    ]
  },
  {
    id: "default_ai_5",
    name: "Gravity Who? 🌪️",
    rounds: 5,
    isAiGenerated: true,
    createdAt: 1700000000001,
    intervals: [
      { name: "Burpees", duration: 45, color: "#E63946", exerciseId: "burpees" },
      { name: "Rest", duration: 10, color: "#4B5563" },
      { name: "Mountain Climbers", duration: 45, color: "#1ACC6C", exerciseId: "mountain_climbers" },
      { name: "Rest", duration: 10, color: "#4B5563" },
      { name: "Alternating Lunges", duration: 45, color: "#F59E0B", exerciseId: "lunges" },
      { name: "Rest", duration: 10, color: "#4B5563" },
      { name: "Pike Pushups", duration: 45, color: "#3B82F6", exerciseId: "pike_pushups" },
      { name: "Rest", duration: 10, color: "#4B5563" },
      { name: "Russian Twists", duration: 45, color: "#8338EC", exerciseId: "russian_twists" }
    ]
  }
];
