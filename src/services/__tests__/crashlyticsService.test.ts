import { Platform, TurboModuleRegistry } from "react-native";
import {
  getCrashlytics,
  log as firebaseLog,
  recordError as firebaseRecordError,
  setAttribute as firebaseSetAttribute,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";
import {
  initCrashlytics,
  logBreadcrumb,
  recordNonFatalError,
  setTelemetryAttribute,
} from "../crashlyticsService";

describe("crashlyticsService", () => {
  const originalDev = (global as any).__DEV__;
  const originalOS = Platform.OS;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = false;
    (Platform as any).OS = "ios";
    debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    (Platform as any).OS = originalOS;
    debugSpy.mockRestore();
  });

  describe("initCrashlytics", () => {
    it("enables crashlytics collection in release builds", async () => {
      await initCrashlytics();

      expect(getCrashlytics).toHaveBeenCalledTimes(1);
      expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
        expect.anything(),
        true
      );
    });

    it("disables crashlytics collection and logs debug message in __DEV__", async () => {
      (global as any).__DEV__ = true;

      await initCrashlytics();

      expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
        expect.anything(),
        false
      );
      expect(debugSpy).toHaveBeenCalledWith(
        "[Crashlytics][DEV] collection disabled"
      );
    });

    it("no-ops on web platform", async () => {
      (Platform as any).OS = "web";

      await initCrashlytics();

      expect(getCrashlytics).not.toHaveBeenCalled();
      expect(setCrashlyticsCollectionEnabled).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", async () => {
      (setCrashlyticsCollectionEnabled as jest.Mock).mockRejectedValueOnce(
        new Error("native failure")
      );

      await expect(initCrashlytics()).resolves.toBeUndefined();
    });
  });

  describe("recordNonFatalError", () => {
    it("logs context breadcrumb and records Error instance in release builds", () => {
      const err = new Error("storage corrupted");

      recordNonFatalError(err, "storage.loadTimers");

      expect(firebaseLog).toHaveBeenCalledWith(
        expect.anything(),
        "storage.loadTimers"
      );
      expect(firebaseRecordError).toHaveBeenCalledWith(
        expect.anything(),
        err,
        "storage.loadTimers"
      );
    });

    it("normalizes non-Error values into an Error instance", () => {
      recordNonFatalError("raw failure", "deepLink.decode");

      expect(firebaseLog).toHaveBeenCalledWith(
        expect.anything(),
        "deepLink.decode"
      );
      expect(firebaseRecordError).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ message: "raw failure" }),
        "deepLink.decode"
      );
    });

    it("suppresses SDK dispatch and emits console.debug in __DEV__", () => {
      (global as any).__DEV__ = true;
      const err = new Error("dev failure");

      recordNonFatalError(err, "audio.play");

      expect(firebaseLog).not.toHaveBeenCalled();
      expect(firebaseRecordError).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        "[Crashlytics][DEV] non-fatal",
        "audio.play",
        err
      );
    });

    it("no-ops on web platform", () => {
      (Platform as any).OS = "web";

      recordNonFatalError(new Error("web err"), "storage.save");

      expect(firebaseRecordError).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", () => {
      (firebaseRecordError as jest.Mock).mockImplementationOnce(() => {
        throw new Error("crashlytics down");
      });

      expect(() =>
        recordNonFatalError(new Error("boom"), "audio.load")
      ).not.toThrow();
    });
  });

  describe("logBreadcrumb", () => {
    it("logs breadcrumb message in release builds", () => {
      logBreadcrumb("ErrorBoundary componentStack");

      expect(firebaseLog).toHaveBeenCalledWith(
        expect.anything(),
        "ErrorBoundary componentStack"
      );
    });

    it("suppresses SDK dispatch and emits console.debug in __DEV__", () => {
      (global as any).__DEV__ = true;

      logBreadcrumb("timer_started");

      expect(firebaseLog).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        "[Crashlytics][DEV] breadcrumb",
        "timer_started"
      );
    });

    it("no-ops on web platform", () => {
      (Platform as any).OS = "web";

      logBreadcrumb("web breadcrumb");

      expect(firebaseLog).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", () => {
      (firebaseLog as jest.Mock).mockImplementationOnce(() => {
        throw new Error("log failed");
      });

      expect(() => logBreadcrumb("test")).not.toThrow();
    });
  });

  describe("setTelemetryAttribute", () => {
    it("sets non-PII attribute in release builds", async () => {
      await setTelemetryAttribute("current_screen", "Timer");

      expect(firebaseSetAttribute).toHaveBeenCalledWith(
        expect.anything(),
        "current_screen",
        "Timer"
      );
    });

    it("suppresses SDK dispatch and emits console.debug in __DEV__", async () => {
      (global as any).__DEV__ = true;

      await setTelemetryAttribute("voice_control_enabled", "true");

      expect(firebaseSetAttribute).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        "[Crashlytics][DEV] attribute",
        "voice_control_enabled",
        "true"
      );
    });

    it("no-ops on web platform", async () => {
      (Platform as any).OS = "web";

      await setTelemetryAttribute("locale", "en");

      expect(firebaseSetAttribute).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", async () => {
      (firebaseSetAttribute as jest.Mock).mockRejectedValueOnce(
        new Error("attr failed")
      );

      await expect(
        setTelemetryAttribute("locale", "es")
      ).resolves.toBeUndefined();
    });
  });

  describe("when native Firebase Crashlytics module is unavailable (Expo Go)", () => {
    it("skips require('@react-native-firebase/crashlytics') when TurboModules are not registered", async () => {
      const existingMock = jest.requireMock("@react-native-firebase/crashlytics");
      const moduleFactory = jest.fn(() => {
        throw new Error("Native module NativeRNFBTurboApp is not registered.");
      });
      try {
        jest.resetModules();
        jest.doMock("@react-native-firebase/crashlytics", moduleFactory);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const rn = require("react-native");
        jest.spyOn(rn.TurboModuleRegistry, "get").mockReturnValue(null);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const isolatedService = require("../crashlyticsService") as typeof import("../crashlyticsService");

        (global as any).__DEV__ = false;
        await expect(isolatedService.initCrashlytics()).resolves.toBeUndefined();
        expect(() =>
          isolatedService.recordNonFatalError(new Error("boom"), "storage.loadTimers")
        ).not.toThrow();
        expect(() => isolatedService.logBreadcrumb("timer_started")).not.toThrow();
        await expect(
          isolatedService.setTelemetryAttribute("current_screen", "Timer")
        ).resolves.toBeUndefined();

        (global as any).__DEV__ = true;
        await expect(isolatedService.initCrashlytics()).resolves.toBeUndefined();

        expect(moduleFactory).not.toHaveBeenCalled();
      } finally {
        jest.resetModules();
        jest.doMock("@react-native-firebase/crashlytics", () => existingMock);
      }
    });

    it("no-ops safely if TurboModuleRegistry.get throws", async () => {
      const spy = jest.spyOn(TurboModuleRegistry, "get").mockImplementation(() => {
        throw new Error("registry unavailable");
      });
      try {
        await expect(initCrashlytics()).resolves.toBeUndefined();
        expect(getCrashlytics).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });

    it("no-ops safely if require('@react-native-firebase/crashlytics') throws", async () => {
      const existingMock = jest.requireMock("@react-native-firebase/crashlytics");
      try {
        jest.resetModules();
        jest.doMock("@react-native-firebase/crashlytics", () => {
          throw new Error("module load error");
        });
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const rn = require("react-native");
        jest.spyOn(rn.TurboModuleRegistry, "get").mockReturnValue({});
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const isolatedService = require("../crashlyticsService") as typeof import("../crashlyticsService");

        await expect(isolatedService.initCrashlytics()).resolves.toBeUndefined();
        expect(() =>
          isolatedService.recordNonFatalError(new Error("boom"), "storage.loadTimers")
        ).not.toThrow();
        expect(() => isolatedService.logBreadcrumb("timer_started")).not.toThrow();
        await expect(
          isolatedService.setTelemetryAttribute("current_screen", "Timer")
        ).resolves.toBeUndefined();
      } finally {
        jest.resetModules();
        jest.doMock("@react-native-firebase/crashlytics", () => existingMock);
      }
    });
  });
});
