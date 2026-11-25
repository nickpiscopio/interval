/* eslint-env jest */
require("react-native-gesture-handler/jestSetup");

// Polyfill window for React 19 test renderer
if (typeof window === "undefined") {
  global.window = global;
}
if (!global.window.dispatchEvent) {
  global.window.dispatchEvent = jest.fn();
}

// Mock @gorhom/bottom-sheet
// The modal renders a pressable backdrop (forwarding pressBehavior "close" to
// the sheet's onDismiss) and surfaces its received props as `sheetProps` on a
// `bottom-sheet-modal` View so tests can assert the configuration contract.
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, Pressable } = require("react-native");
  const actualMock = require("@gorhom/bottom-sheet/mock");
  const DismissContext = React.createContext(() => {});

  const BottomSheetBackdrop = ({ pressBehavior }) => {
    const onDismiss = React.useContext(DismissContext);
    return React.createElement(Pressable, {
      testID: "bottom-sheet-backdrop",
      onPress: () => {
        if (pressBehavior === "close") onDismiss();
      },
    });
  };

  class BottomSheetModal extends React.Component {
    present() {}
    dismiss() {}
    render() {
      const { children, backdropComponent, onDismiss, ...rest } = this.props;
      return React.createElement(
        View,
        { testID: "bottom-sheet-modal", sheetProps: { ...rest, onDismiss } },
        React.createElement(
          DismissContext.Provider,
          { value: () => onDismiss && onDismiss() },
          backdropComponent
            ? backdropComponent({ animatedIndex: { value: 0 }, animatedPosition: { value: 0 }, style: {} })
            : null,
          children
        )
      );
    }
  }

  return {
    ...actualMock,
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

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

// Mock Expo Audio
jest.mock("expo-audio", () => {
  const createMockPlayer = () => {
    let currentTime = 0;
    return {
      get currentTime() {
        return currentTime;
      },
      set currentTime(val) {
        currentTime = val;
      },
      play: jest.fn(() => {
        currentTime = 0.5;
      }),
      pause: jest.fn(),
      seekTo: jest.fn().mockImplementation((seconds) => {
        currentTime = seconds;
        return Promise.resolve();
      }),
      release: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
      get currentStatus() {
        return { playing: false, currentTime, duration: 0 };
      },
    };
  };
  return {
    createAudioPlayer: jest.fn(() => createMockPlayer()),
    useAudioPlayer: jest.fn(() => createMockPlayer()),
    useAudioPlayerStatus: jest.fn(() => ({ playing: false, currentTime: 0, duration: 0 })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    setIsAudioActiveAsync: jest.fn().mockResolvedValue(undefined),
  };
});

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

// Mock Expo Keep Awake
jest.mock("expo-keep-awake", () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
  deactivateKeepAwake: jest.fn(),
  useKeepAwake: jest.fn(),
}));

// Mock Expo Screen Orientation
jest.mock("expo-screen-orientation", () => ({
  unlockAsync: jest.fn().mockResolvedValue(undefined),
  lockAsync: jest.fn().mockResolvedValue(undefined),
  OrientationLock: {
    DEFAULT: 0,
    ALL: 1,
    PORTRAIT: 2,
    PORTRAIT_UP: 3,
    PORTRAIT_DOWN: 4,
    LANDSCAPE: 5,
    LANDSCAPE_LEFT: 6,
    LANDSCAPE_RIGHT: 7,
    OTHER: 8,
    UNKNOWN: 9,
  },
}));

// Mock Expo Speech Recognition
jest.mock("expo-speech-recognition", () => {
  const React = require("react");
  const listeners = new Map();

  const defaultPermissionResult = {
    granted: true,
    status: "granted",
    canAskAgain: true,
    expires: "never",
  };

  const ExpoSpeechRecognitionModule = {
    isRecognitionAvailable: jest.fn(() => true),
    supportsOnDeviceRecognition: jest.fn(() => true),
    requestPermissionsAsync: jest.fn(() => Promise.resolve(defaultPermissionResult)),
    getPermissionsAsync: jest.fn(() => Promise.resolve(defaultPermissionResult)),
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
  };

  const useSpeechRecognitionEvent = (eventName, listener) => {
    const listenerRef = React.useRef(listener);
    listenerRef.current = listener;

    React.useEffect(() => {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      const wrapped = (event) => {
        if (listenerRef.current) {
          listenerRef.current(event);
        }
      };
      listeners.get(eventName).add(wrapped);
      return () => {
        const set = listeners.get(eventName);
        if (set) {
          set.delete(wrapped);
          if (set.size === 0) {
            listeners.delete(eventName);
          }
        }
      };
    }, [eventName]);
  };

  const __emitSpeechRecognitionEvent = (eventName, payload) => {
    const set = listeners.get(eventName);
    if (!set) return;
    for (const fn of Array.from(set)) {
      fn(payload);
    }
  };

  const __resetSpeechRecognitionMock = () => {
    listeners.clear();
    ExpoSpeechRecognitionModule.isRecognitionAvailable.mockReset().mockImplementation(() => true);
    ExpoSpeechRecognitionModule.supportsOnDeviceRecognition.mockReset().mockImplementation(() => true);
    ExpoSpeechRecognitionModule.requestPermissionsAsync
      .mockReset()
      .mockImplementation(() => Promise.resolve(defaultPermissionResult));
    ExpoSpeechRecognitionModule.getPermissionsAsync
      .mockReset()
      .mockImplementation(() => Promise.resolve(defaultPermissionResult));
    ExpoSpeechRecognitionModule.start.mockReset();
    ExpoSpeechRecognitionModule.stop.mockReset();
    ExpoSpeechRecognitionModule.abort.mockReset();
  };

  return {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
    __emitSpeechRecognitionEvent,
    __resetSpeechRecognitionMock,
  };
});

// Expose Firebase TurboModule stubs on TurboModuleRegistry.get so telemetry
// wrappers recognize native Firebase as registered in Jest by default.
const { TurboModuleRegistry } = require("react-native");
if (TurboModuleRegistry && typeof TurboModuleRegistry.get === "function") {
  const originalTurboModuleGet = TurboModuleRegistry.get.bind(TurboModuleRegistry);
  const firebaseTurboModules = new Set([
    "NativeRNFBTurboApp",
    "NativeRNFBTurboAnalytics",
    "NativeRNFBTurboCrashlytics",
  ]);
  jest.spyOn(TurboModuleRegistry, "get").mockImplementation((name) => {
    if (firebaseTurboModules.has(name)) {
      return {};
    }
    return originalTurboModuleGet(name);
  });
}

// Mock @react-native-firebase/app
jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({ name: "[DEFAULT]" })),
}));

// Mock @react-native-firebase/analytics
jest.mock("@react-native-firebase/analytics", () => {
  const mockAnalyticsInstance = { app: { name: "[DEFAULT]" } };
  return {
    getAnalytics: jest.fn(() => mockAnalyticsInstance),
    logEvent: jest.fn().mockResolvedValue(undefined),
    setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    __mockAnalyticsInstance: mockAnalyticsInstance,
  };
});

// Mock @react-native-firebase/crashlytics
jest.mock("@react-native-firebase/crashlytics", () => {
  const mockCrashlyticsInstance = { app: { name: "[DEFAULT]" } };
  return {
    getCrashlytics: jest.fn(() => mockCrashlyticsInstance),
    setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(null),
    recordError: jest.fn(),
    log: jest.fn(),
    setAttribute: jest.fn().mockResolvedValue(null),
    setAttributes: jest.fn().mockResolvedValue(null),
    __mockCrashlyticsInstance: mockCrashlyticsInstance,
  };
});
