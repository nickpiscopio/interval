import { logScreenView } from "../services/analyticsService";
import { setTelemetryAttribute } from "../services/crashlyticsService";

export type RootTabScreen = "Workouts" | "ExerciseLibrary";

let activeRootTab: RootTabScreen = "Workouts";
let lastTrackedScreen: string | undefined;

export function resetActiveRootTab(): void {
  activeRootTab = "Workouts";
  lastTrackedScreen = undefined;
}

export function resolveRouteScreenName(routeName?: string): string | undefined {
  if (!routeName) {
    return undefined;
  }
  return routeName === "Root" ? activeRootTab : routeName;
}

export function trackScreenIfChanged(screenName?: string): void {
  if (!screenName || lastTrackedScreen === screenName) {
    return;
  }
  lastTrackedScreen = screenName;
  void logScreenView(screenName);
  void setTelemetryAttribute("current_screen", screenName);
}

export function trackRootTabScreen(tab: RootTabScreen): void {
  activeRootTab = tab;
  trackScreenIfChanged(tab);
}
