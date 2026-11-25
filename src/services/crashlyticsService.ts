import { Platform, TurboModuleRegistry } from "react-native";
import type * as FirebaseCrashlyticsModule from "@react-native-firebase/crashlytics";

function isNativeFirebaseCrashlyticsRegistered(): boolean {
  try {
    return (
      TurboModuleRegistry.get("NativeRNFBTurboApp") != null &&
      TurboModuleRegistry.get("NativeRNFBTurboCrashlytics") != null
    );
  } catch {
    return false;
  }
}

function getFirebaseCrashlyticsModule(): typeof FirebaseCrashlyticsModule | null {
  // Check TurboModule registration before calling require(). In Metro/Expo Go,
  // calling require() on an uninitialized module that throws at evaluation time
  // triggers guardedLoadModule -> ErrorUtils.reportFatalError() before try/catch.
  if (!isNativeFirebaseCrashlyticsRegistered()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-firebase/crashlytics") as typeof FirebaseCrashlyticsModule;
  } catch {
    return null;
  }
}

export type TelemetryAttributeKey =
  | "current_screen"
  | "locale"
  | "voice_control_enabled";

function isDevMode(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

function isWebPlatform(): boolean {
  return Platform.OS === "web";
}

export async function initCrashlytics(): Promise<void> {
  if (isWebPlatform()) {
    return;
  }

  try {
    const mod = getFirebaseCrashlyticsModule();
    if (!mod) {
      return;
    }
    const crashlytics = mod.getCrashlytics();
    if (isDevMode()) {
      await mod.setCrashlyticsCollectionEnabled(crashlytics, false);
      console.debug("[Crashlytics][DEV] collection disabled");
      return;
    }

    await mod.setCrashlyticsCollectionEnabled(crashlytics, true);
  } catch {
    // Fail-safe: crash reporting must never disrupt app execution.
  }
}

export function recordNonFatalError(error: unknown, context: string): void {
  if (isWebPlatform()) {
    return;
  }

  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  if (isDevMode()) {
    console.debug("[Crashlytics][DEV] non-fatal", context, normalizedError);
    return;
  }

  try {
    const mod = getFirebaseCrashlyticsModule();
    if (!mod) {
      return;
    }
    const crashlytics = mod.getCrashlytics();
    mod.log(crashlytics, context);
    mod.recordError(crashlytics, normalizedError, context);
  } catch {
    // Fail-safe: crash reporting must never disrupt app execution.
  }
}

export function logBreadcrumb(message: string): void {
  if (isWebPlatform()) {
    return;
  }

  if (isDevMode()) {
    console.debug("[Crashlytics][DEV] breadcrumb", message);
    return;
  }

  try {
    const mod = getFirebaseCrashlyticsModule();
    if (!mod) {
      return;
    }
    const crashlytics = mod.getCrashlytics();
    mod.log(crashlytics, message);
  } catch {
    // Fail-safe: crash reporting must never disrupt app execution.
  }
}

export async function setTelemetryAttribute(
  key: TelemetryAttributeKey,
  value: string
): Promise<void> {
  if (isWebPlatform()) {
    return;
  }

  if (isDevMode()) {
    console.debug("[Crashlytics][DEV] attribute", key, value);
    return;
  }

  try {
    const mod = getFirebaseCrashlyticsModule();
    if (!mod) {
      return;
    }
    const crashlytics = mod.getCrashlytics();
    await mod.setAttribute(crashlytics, key, value);
  } catch {
    // Fail-safe: crash reporting must never disrupt app execution.
  }
}
