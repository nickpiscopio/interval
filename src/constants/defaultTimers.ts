import { Timer } from "../model/Timer";

export const DEFAULT_AI_TIMERS: Timer[] = [
  {
    id: "default_day_1",
    name: "Day 1: 💥 Full Body Power Blast!",
    rounds: 2,
    isAiGenerated: true,
    createdAt: 1700000000005,
    intervals: [
      { id: "d1_int_1", name: "Get Ready", duration: 10, color: "#1ACC6C" },
      { id: "d1_int_2", name: "Jog in Place", duration: 20, color: "#1ACC6C", exerciseId: "jog_in_place" },
      { id: "d1_int_3", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d1_int_4", name: "Squats", duration: 20, color: "#1ACC6C", exerciseId: "squats" },
      { id: "d1_int_5", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d1_int_6", name: "Push-Ups", duration: 20, color: "#1ACC6C", exerciseId: "pushups" },
      { id: "d1_int_7", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d1_int_8", name: "Lunges", duration: 20, color: "#1ACC6C", exerciseId: "lunges" },
      { id: "d1_int_9", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d1_int_10", name: "Plank", duration: 20, color: "#1ACC6C", exerciseId: "plank" }
    ]
  },
  {
    id: "default_day_2",
    name: "Day 2: 🔥 Six-Pack Turbo Abs",
    rounds: 2,
    isAiGenerated: true,
    createdAt: 1700000000004,
    intervals: [
      { id: "d2_int_1", name: "Get Ready", duration: 10, color: "#1ACC6C" },
      { id: "d2_int_2", name: "Jumping Jacks", duration: 20, color: "#1ACC6C", exerciseId: "jumping_jacks" },
      { id: "d2_int_3", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d2_int_4", name: "Mountain Climbers", duration: 20, color: "#1ACC6C", exerciseId: "mountain_climbers" },
      { id: "d2_int_5", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d2_int_6", name: "Bicycle Crunches", duration: 20, color: "#1ACC6C", exerciseId: "bicycle_crunches" },
      { id: "d2_int_7", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d2_int_8", name: "High Knees", duration: 20, color: "#1ACC6C", exerciseId: "high_knees" },
      { id: "d2_int_9", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d2_int_10", name: "Mason Twists", duration: 20, color: "#1ACC6C", exerciseId: "mason_twists" }
    ]
  },
  {
    id: "default_day_3",
    name: "Day 3: 💪 Upper Body Muscle Mania",
    rounds: 2,
    isAiGenerated: true,
    createdAt: 1700000000003,
    intervals: [
      { id: "d3_int_1", name: "Get Ready", duration: 10, color: "#1ACC6C" },
      { id: "d3_int_2", name: "Arm Circles", duration: 20, color: "#1ACC6C", exerciseId: "arm_circles" },
      { id: "d3_int_3", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d3_int_4", name: "Wide-Grip Push-Ups", duration: 20, color: "#1ACC6C", exerciseId: "wide_grip_pushups" },
      { id: "d3_int_5", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d3_int_6", name: "Superman", duration: 20, color: "#1ACC6C", exerciseId: "superman" },
      { id: "d3_int_7", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d3_int_8", name: "Close-Grip Push-Ups", duration: 20, color: "#1ACC6C", exerciseId: "close_grip_pushups" },
      { id: "d3_int_9", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d3_int_10", name: "Superman", duration: 20, color: "#1ACC6C", exerciseId: "superman" }
    ]
  },
  {
    id: "default_day_4",
    name: "Day 4: 🦵 Thunder Legs",
    rounds: 2,
    isAiGenerated: true,
    createdAt: 1700000000002,
    intervals: [
      { id: "d4_int_1", name: "Get Ready", duration: 10, color: "#1ACC6C" },
      { id: "d4_int_2", name: "Left Leg Swings", duration: 10, color: "#1ACC6C", exerciseId: "left_leg_swings" },
      { id: "d4_int_3", name: "Right Leg Swings", duration: 10, color: "#1ACC6C", exerciseId: "right_leg_swings" },
      { id: "d4_int_4", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d4_int_5", name: "Glute Bridges", duration: 20, color: "#1ACC6C", exerciseId: "glute_bridges" },
      { id: "d4_int_6", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d4_int_7", name: "Left Side Leg Lifts", duration: 10, color: "#1ACC6C", exerciseId: "left_side_leg_lifts" },
      { id: "d4_int_8", name: "Right Side Leg Lifts", duration: 10, color: "#1ACC6C", exerciseId: "right_side_leg_lifts" },
      { id: "d4_int_9", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d4_int_10", name: "Calf Raises", duration: 20, color: "#1ACC6C", exerciseId: "calf_raises" },
      { id: "d4_int_11", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d4_int_12", name: "Wall Sit", duration: 20, color: "#1ACC6C", exerciseId: "wall_sit" },
      { id: "d4_int_13", name: "Rest", duration: 10, color: "#4B5563" },
      { id: "d4_int_14", name: "Squat Jumps", duration: 20, color: "#1ACC6C", exerciseId: "squat_jumps" }
    ]
  },
  {
    id: "default_day_5",
    name: "Day 5: 🧘‍♀️ Stretch & Chill",
    rounds: 3,
    isAiGenerated: true,
    createdAt: 1700000000001,
    intervals: [
      { id: "d5_int_1", name: "Get Ready", duration: 10, color: "#1ACC6C" },
      { id: "d5_int_2", name: "Left Arm Shoulder Stretch", duration: 10, color: "#1ACC6C", exerciseId: "left_arm_shoulder_stretch" },
      { id: "d5_int_3", name: "Right Arm Shoulder Stretch", duration: 10, color: "#1ACC6C", exerciseId: "right_arm_shoulder_stretch" },
      { id: "d5_int_4", name: "Left Arm Tricep Stretch", duration: 10, color: "#1ACC6C", exerciseId: "left_arm_tricep_stretch" },
      { id: "d5_int_5", name: "Right Arm Tricep Stretch", duration: 10, color: "#1ACC6C", exerciseId: "right_arm_tricep_stretch" },
      { id: "d5_int_6", name: "Rest", duration: 5, color: "#4B5563" },
      { id: "d5_int_7", name: "Seated Toe Touch", duration: 10, color: "#1ACC6C", exerciseId: "seated_toe_touch" },
      { id: "d5_int_8", name: "Rest", duration: 5, color: "#4B5563" },
      { id: "d5_int_9", name: "Cat Cow", duration: 10, color: "#1ACC6C", exerciseId: "cat_cow" },
      { id: "d5_int_10", name: "Left Side Quad Stretch", duration: 10, color: "#1ACC6C", exerciseId: "left_side_quad_stretch" },
      { id: "d5_int_11", name: "Right Side Quad Stretch", duration: 10, color: "#1ACC6C", exerciseId: "right_side_quad_stretch" },
      { id: "d5_int_12", name: "Rest", duration: 5, color: "#4B5563" },
      { id: "d5_int_13", name: "Child's Pose", duration: 10, color: "#1ACC6C", exerciseId: "childs_pose" }
    ]
  }
];
