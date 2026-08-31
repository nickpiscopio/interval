/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { StackScreenProps } from "@react-navigation/stack";
import { Timer } from "./model/Timer";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  CreateTimer: { timer?: Timer } | undefined;
  Timer: { timer: Timer };
  GenerateTimer: undefined;
  Completion: { timer: Timer };
  Awards: undefined;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, Screen>;
