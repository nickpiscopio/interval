/* eslint-env jest */
require("react-native-gesture-handler/jestSetup");

// Polyfill window for React 19 test renderer
if (typeof window === "undefined") {
  global.window = global;
}
if (!global.window.dispatchEvent) {
  global.window.dispatchEvent = jest.fn();
}

// Mock React Navigation useIsFocused
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useIsFocused: jest.fn(() => true),
  };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => {
  let store = {};
  return {
    getItem: jest.fn(async (key) => store[key] || null),
    setItem: jest.fn(async (key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(async (key) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
    getAllKeys: jest.fn(async () => Object.keys(store)),
    multiGet: jest.fn(async (keys) => keys.map((k) => [k, store[k] || null])),
  };
});

// Mock Expo Haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock Expo AV
jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(async () => ({
        sound: {
          playAsync: jest.fn().mockResolvedValue({}),
          unloadAsync: jest.fn().mockResolvedValue({}),
          stopAsync: jest.fn().mockResolvedValue({}),
          replayAsync: jest.fn().mockResolvedValue({}),
          setPositionAsync: jest.fn().mockResolvedValue({}),
        },
        status: {},
      })),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
  },
}));

// Mock Expo Video
jest.mock("expo-video", () => ({
  VideoView: "VideoView",
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    loop: true,
  })),
}));

// Mock Expo Linear Gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, style, ...props }) =>
      React.createElement(View, { style, ...props }, children),
  };
});

// Mock Expo Status Bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// Mock Expo Localization
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en", languageTag: "en-US" }],
}));

// Mock Expo Linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path) => `interval://${path || ""}`),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(async () => null),
  openURL: jest.fn().mockResolvedValue(true),
}));

// Mock Expo Font & Splash Screen
jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn(() => true),
}));
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true),
}));

// Mock Masked View
jest.mock("@react-native-masked-view/masked-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, ...props }) => React.createElement(View, props, children);
});
jest.mock(
  "@react-native-community/masked-view",
  () => {
    const React = require("react");
    const { View } = require("react-native");
    return ({ children, ...props }) => React.createElement(View, props, children);
  },
  { virtual: true }
);

// Mock Gradient Icon
jest.mock("react-native-gradient-icon", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Icon: ({ name, ...props }) =>
      React.createElement(Text, { testID: `icon-${name}`, ...props }, name),
  };
});

// Mock Expo Vector Icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const MockIcon = ({ name, ...props }) =>
    React.createElement(Text, { testID: `icon-${name}`, ...props }, name);
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
    Feather: MockIcon,
  };
});

// Mock React Native Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Draggable FlatList
jest.mock("react-native-draggable-flatlist", () => {
  const React = require("react");
  const { FlatList } = require("react-native");
  const MockDraggableFlatList = React.forwardRef(({ renderItem, data, ...props }, ref) => {
    return React.createElement(FlatList, {
      ref,
      data,
      renderItem: ({ item, index }) =>
        renderItem({
          item,
          getIndex: () => index,
          drag: jest.fn(),
          isActive: false,
        }),
      ...props,
    });
  });
  return {
    __esModule: true,
    default: MockDraggableFlatList,
    ScaleDecorator: ({ children }) => children,
    ShadowDecorator: ({ children }) => children,
    OpacityDecorator: ({ children }) => children,
    useOnCellActiveAnimation: () => ({
      isActive: false,
      onActiveAnim: { value: 0 },
    }),
  };
});

// Mock React Native Safe Area Context
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  const frame = { x: 0, y: 0, width: 375, height: 812 };
  const SafeAreaInsetsContext = React.createContext(insets);
  const SafeAreaFrameContext = React.createContext(frame);

  return {
    SafeAreaProvider: ({ children }) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        { value: insets },
        React.createElement(SafeAreaFrameContext.Provider, { value: frame }, children)
      ),
    SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaView: ({ children, style, ...props }) =>
      React.createElement(View, { style, ...props }, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});
