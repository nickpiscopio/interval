import React from "react";
import { ExerciseLibraryView } from "./ExerciseLibraryView";
import { Exercise } from "../model/Exercise";

export interface ExercisePickerViewProps {
  onBack?: () => void;
  onClose?: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePickerView({ onBack, onClose, onSelect }: ExercisePickerViewProps) {
  return (
    <ExerciseLibraryView
      onBack={onBack}
      onClose={onClose}
      onSelect={onSelect}
      bottomPadding={24}
    />
  );
}
