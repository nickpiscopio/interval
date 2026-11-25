/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../types";
import { decodeBase64 } from "../utils/base64";
import { logEvent } from "../services/analyticsService";
import { recordNonFatalError } from "../services/crashlyticsService";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL("/"),
    "interval://", // support native custom scheme
  ],
  config: {
    screens: {
      Root: "selecttimer",
      CreateTimer: {
        path: "import",
        parse: {
          timer: (data: string) => {
            try {
              const decoded = decodeBase64(data);
              const parsed = JSON.parse(decoded);
              if (
                parsed &&
                Array.isArray(parsed.intervals) &&
                typeof parsed.rounds === "number"
              ) {
                const intervalsDuration = parsed.intervals.reduce(
                  (sum: number, interval: { duration?: number }) =>
                    sum + (Number(interval?.duration) || 0),
                  0
                );
                void logEvent("timer_imported", {
                  interval_count: parsed.intervals.length,
                  rounds: parsed.rounds,
                  total_seconds: intervalsDuration * parsed.rounds,
                });
              }
              return parsed;
            } catch (e) {
              recordNonFatalError(e, "deepLink.parseSharedTimer");
              console.warn("Failed to parse shared timer:", e);
              return undefined;
            }
          },
        },
      },
      Timer: "timer",
      GenerateTimer: "generatetimer",
      Completion: "completion",
      Modal: "modal",
      NotFound: "*",
    },
  },
};

export default linking;
