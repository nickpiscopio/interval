import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import ErrorBoundary from "./src/components/ErrorBoundary";
import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";
import { AlertProvider } from "./src/context/AlertContext";
import { getLocale } from "./src/i18n";
import { initAnalytics } from "./src/services/analyticsService";
import {
  initCrashlytics,
  setTelemetryAttribute,
} from "./src/services/crashlyticsService";

export default function App() {
  const isLoadingComplete = useCachedResources();

  useEffect(() => {
    void initAnalytics();
    void initCrashlytics();
    void setTelemetryAttribute("locale", getLocale());
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <AlertProvider>
                <Navigation />
                <StatusBar style="dark" />
              </AlertProvider>
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }
}
