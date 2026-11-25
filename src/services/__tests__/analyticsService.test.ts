import { Platform, TurboModuleRegistry } from "react-native";
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setAnalyticsCollectionEnabled,
} from "@react-native-firebase/analytics";
import {
  initAnalytics,
  logEvent,
  logScreenView,
} from "../analyticsService";

describe("analyticsService", () => {
  const originalDev = (global as any).__DEV__;
  const originalOS = Platform.OS;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = false;
    (Platform as any).OS = "ios";
    debugSpy = jest.spyOn(console, "debug").mockImplementation(() => { });
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    (Platform as any).OS = originalOS;
    debugSpy.mockRestore();
  });

  describe("initAnalytics", () => {
    it("enables analytics collection in release builds", async () => {
      await initAnalytics();

      expect(getAnalytics).toHaveBeenCalledTimes(1);
      expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
        expect.anything(),
        true
      );
    });

    it("disables analytics collection and logs debug message in __DEV__", async () => {
      (global as any).__DEV__ = true;

      await initAnalytics();

      expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
        expect.anything(),
        false
      );
      expect(debugSpy).toHaveBeenCalledWith(
        "[Analytics][DEV] collection disabled"
      );
    });

    it("no-ops on web platform", async () => {
      (Platform as any).OS = "web";

      await initAnalytics();

      expect(getAnalytics).not.toHaveBeenCalled();
      expect(setAnalyticsCollectionEnabled).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", async () => {
      (setAnalyticsCollectionEnabled as jest.Mock).mockRejectedValueOnce(
        new Error("native failure")
      );

      await expect(initAnalytics()).resolves.toBeUndefined();
    });
  });

  describe("logScreenView", () => {
    it("dispatches GA4 screen_view event in release builds", async () => {
      await logScreenView("Workouts");

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "screen_view",
        {
          screen_name: "Workouts",
          screen_class: "Workouts",
        }
      );
    });

    it("suppresses SDK dispatch and emits console.debug in __DEV__", async () => {
      (global as any).__DEV__ = true;

      await logScreenView("ExerciseLibrary");

      expect(firebaseLogEvent).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        "[Analytics][DEV] screen_view",
        { screen_name: "ExerciseLibrary", screen_class: "ExerciseLibrary" }
      );
    });

    it("no-ops on web platform", async () => {
      (Platform as any).OS = "web";

      await logScreenView("Timer");

      expect(firebaseLogEvent).not.toHaveBeenCalled();
    });

    it("swallows native SDK errors safely", async () => {
      (firebaseLogEvent as jest.Mock).mockRejectedValueOnce(
        new Error("sdk error")
      );

      await expect(logScreenView("Awards")).resolves.toBeUndefined();
    });
  });

  describe("logEvent", () => {
    it("dispatches typed GA4 events with parameters in release builds", async () => {
      await logEvent("timer_started", {
        is_ai_generated: true,
        interval_count: 6,
        rounds: 3,
        total_seconds: 540,
      });

      expect(firebaseLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        "timer_started",
        {
          is_ai_generated: true,
          interval_count: 6,
          rounds: 3,
          total_seconds: 540,
        }
      );
    });

    it("suppresses SDK dispatch and emits console.debug in __DEV__", async () => {
      (global as any).__DEV__ = true;

      await logEvent("voice_control_toggled", { enabled: true });

      expect(firebaseLogEvent).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        "[Analytics][DEV] voice_control_toggled",
        { enabled: true }
      );
    });

    it("no-ops on web platform", async () => {
      (Platform as any).OS = "web";

      await logEvent("timer_deleted", { count: 2 });

      expect(firebaseLogEvent).not.toHaveBeenCalled();
    });

    it("swallows synchronous or asynchronous SDK exceptions safely", async () => {
      (getAnalytics as jest.Mock).mockImplementationOnce(() => {
        throw new Error("module unavailable");
      });

      await expect(
        logEvent("legal_disclaimer_accepted", { app_version: "2026.11.25" })
      ).resolves.toBeUndefined();
    });
  });

  describe("when native Firebase Analytics module is unavailable (Expo Go)", () => {
    it("skips require('@react-native-firebase/analytics') when TurboModules are not registered", async () => {
      const existingMock = jest.requireMock("@react-native-firebase/analytics");
      const moduleFactory = jest.fn(() => {
        throw new Error("Native module NativeRNFBTurboApp is not registered.");
      });
      try {
        jest.resetModules();
        jest.doMock("@react-native-firebase/analytics", moduleFactory);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const rn = require("react-native");
        jest.spyOn(rn.TurboModuleRegistry, "get").mockReturnValue(null);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const isolatedService = require("../analyticsService") as typeof import("../analyticsService");

        (global as any).__DEV__ = false;
        await expect(isolatedService.initAnalytics()).resolves.toBeUndefined();
        await expect(isolatedService.logScreenView("Workouts")).resolves.toBeUndefined();
        await expect(
          isolatedService.logEvent("timer_started", {
            is_ai_generated: false,
            interval_count: 4,
            rounds: 2,
            total_seconds: 240,
          })
        ).resolves.toBeUndefined();

        (global as any).__DEV__ = true;
        await expect(isolatedService.initAnalytics()).resolves.toBeUndefined();

        expect(moduleFactory).not.toHaveBeenCalled();
      } finally {
        jest.resetModules();
        jest.doMock("@react-native-firebase/analytics", () => existingMock);
      }
    });

    it("no-ops safely if TurboModuleRegistry.get throws", async () => {
      const spy = jest.spyOn(TurboModuleRegistry, "get").mockImplementation(() => {
        throw new Error("registry unavailable");
      });
      try {
        await expect(initAnalytics()).resolves.toBeUndefined();
        expect(getAnalytics).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });

    it("no-ops safely if require('@react-native-firebase/analytics') throws", async () => {
      const existingMock = jest.requireMock("@react-native-firebase/analytics");
      try {
        jest.resetModules();
        jest.doMock("@react-native-firebase/analytics", () => {
          throw new Error("module load error");
        });
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const rn = require("react-native");
        jest.spyOn(rn.TurboModuleRegistry, "get").mockReturnValue({});
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const isolatedService = require("../analyticsService") as typeof import("../analyticsService");

        await expect(isolatedService.initAnalytics()).resolves.toBeUndefined();
        await expect(isolatedService.logScreenView("Workouts")).resolves.toBeUndefined();
        await expect(
          isolatedService.logEvent("timer_deleted", { count: 1 })
        ).resolves.toBeUndefined();
      } finally {
        jest.resetModules();
        jest.doMock("@react-native-firebase/analytics", () => existingMock);
      }
    });
  });
});
