import React from "react";
import { BottomSheetFrame } from "./BottomSheetFrame";
import { ExerciseDetailView } from "./ExerciseDetailView";
import { Exercise } from "../model/Exercise";

export interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: Exercise | null;
  mode?: "picker" | "library";
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
  onStartQuickRoutine?: (exercise: Exercise) => void;
  onCreateCustomTimer?: (exercise: Exercise) => void;
}

export function ExerciseDetailModal({
  visible,
  exercise,
  mode = "picker",
  onClose,
  onSelectExercise,
  onStartQuickRoutine,
  onCreateCustomTimer,
}: ExerciseDetailModalProps) {
  if (!visible || !exercise) {
    return null;
  }

  return (
    <BottomSheetFrame visible={visible} onClose={onClose} snapPoints={["90%"]}>
      <ExerciseDetailView
        exercise={exercise}
        mode={mode}
        onBack={onClose}
        onSelectExercise={onSelectExercise}
        onStartQuickRoutine={onStartQuickRoutine}
        onCreateCustomTimer={onCreateCustomTimer}
      />
    </BottomSheetFrame>
  );
}
