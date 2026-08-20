/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../types";
import { decodeBase64 } from "../utils/base64";

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
              return JSON.parse(decoded);
            } catch (e) {
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
