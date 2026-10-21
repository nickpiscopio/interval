import React from "react";
import { BottomSheetFrame } from "./BottomSheetFrame";
import { ExercisePickerView } from "./ExercisePickerView";
import { Exercise } from "../model/Exercise";

export interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  if (!visible) {
    return null;
  }

  function handleSelect(item: Exercise) {
    onSelect(item);
    onClose();
  }

  return (
    <BottomSheetFrame visible={visible} onClose={onClose}>
      <ExercisePickerView onClose={onClose} onSelect={handleSelect} />
    </BottomSheetFrame>
  );
}
