import { Interval } from "./Interval";

export interface Timer {
  id: string;
  name: string;
  rounds: number;
  intervals: Interval[];
  createdAt: number;
  isAiGenerated?: boolean;
}

