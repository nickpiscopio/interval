import { Platform, TurboModuleRegistry } from "react-native";
import type * as FirebaseAnalyticsModule from "@react-native-firebase/analytics";

function isNativeFirebaseAnalyticsRegistered(): boolean {
  try {
    return (
      TurboModuleRegistry.get("NativeRNFBTurboApp") != null &&
      TurboModuleRegistry.get("NativeRNFBTurboAnalytics") != null
    );
  } catch {
    return false;
  }
}

function getFirebaseAnalyticsModule(): typeof FirebaseAnalyticsModule | null {
  // Check TurboModule registration before calling require(). In Metro/Expo Go,
  // calling require() on an uninitialized module that throws at evaluation time
  // triggers guardedLoadModule -> ErrorUtils.reportFatalError() before try/catch.
  if (!isNativeFirebaseAnalyticsRegistered()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-firebase/analytics") as typeof FirebaseAnalyticsModule;
  } catch {
    return null;
  }
}

export type ScreenName =
  | "Workouts"
  | "ExerciseLibrary"
  | "CreateTimer"
  | "Timer"
  | "GenerateTimer"
  | "Completion"
  | "Awards"
  | "NotFound";

export interface AnalyticsEventMap {
  timer_started: {
    is_ai_generated: boolean;
    interval_count: number;
    rounds: number;
    total_seconds: number;
  };
  timer_completed: {
    is_ai_generated: boolean;
    total_seconds: number;
    performed_seconds: number;
    qualifies_for_credit: boolean;
  };
  timer_abandoned: {
    is_ai_generated: boolean;
    total_seconds: number;
    performed_seconds: number;
    completion_pct: number;
  };
  timer_saved: {
    mode: "create" | "edit";
    is_ai_generated: boolean;
    interval_count: number;
    rounds: number;
    total_seconds: number;
  };
  timer_deleted: {
    count: number;
  };
  timer_shared: {
    method: "link" | "completion_card";
    count: number;
  };
  timer_imported: {
    interval_count: number;
    rounds: number;
    total_seconds: number;
  };
  timer_generated: {
    goal: string;
    area: string;
    experience: string;
    interval_count: number;
    rounds: number;
  };
  voice_control_toggled: {
    enabled: boolean;
  };
  voice_command_triggered: {
    command: "play" | "pause";
  };
  exercise_viewed: {
    exercise_id: string;
    category: string;
    has_video: boolean;
  };
  exercise_filtered: {
    filter_type: "category" | "body_part";
    value: string;
  };
  badge_unlocked: {
    badge_id: string;
    category: string;
  };
  legal_disclaimer_accepted: {
    app_version: string;
  };
  completion_restart_tapped: {
    is_ai_generated: boolean;
    total_seconds: number;
  };
  completion_rate_app_tapped: {
    platform: string;
  };
  completion_awards_tapped: {
    newly_unlocked_count: number;
  };
  badge_shared: {
    badge_id: string;
    category: string;
  };
  completion_badge_inspected: {
    badge_id: string;
    category: string;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

function isDevMode(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

function isWebPlatform(): boolean {
  return Platform.OS === "web";
}

export async function initAnalytics(): Promise<void> {
  if (isWebPlatform()) {
    return;
  }

  try {
    const mod = getFirebaseAnalyticsModule();
    if (!mod) {
      return;
    }
    const analytics = mod.getAnalytics();
    if (isDevMode()) {
      await mod.setAnalyticsCollectionEnabled(analytics, false);
      console.debug("[Analytics][DEV] collection disabled");
      return;
    }

    await mod.setAnalyticsCollectionEnabled(analytics, true);
  } catch {
    // Fail-safe: analytics must never disrupt app execution.
  }
}

export async function logScreenView(screenName: ScreenName | string): Promise<void> {
  if (isWebPlatform()) {
    return;
  }

  const params = {
    screen_name: screenName,
    screen_class: screenName,
  };

  if (isDevMode()) {
    console.debug("[Analytics][DEV] screen_view", params);
    return;
  }

  try {
    const mod = getFirebaseAnalyticsModule();
    if (!mod) {
      return;
    }
    const analytics = mod.getAnalytics();
    await mod.logEvent(analytics, "screen_view", params);
  } catch {
    // Fail-safe: analytics must never disrupt app execution.
  }
}

export async function logEvent<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEventMap[K]
): Promise<void> {
  if (isWebPlatform()) {
    return;
  }

  if (isDevMode()) {
    console.debug(`[Analytics][DEV] ${name}`, params);
    return;
  }

  try {
    const mod = getFirebaseAnalyticsModule();
    if (!mod) {
      return;
    }
    const analytics = mod.getAnalytics();
    await mod.logEvent(analytics, name, params as Record<string, unknown>);
  } catch {
    // Fail-safe: analytics must never disrupt app execution.
  }
}
