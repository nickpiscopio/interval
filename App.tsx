import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";
import { AlertProvider } from "./src/context/AlertContext";

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AlertProvider>
            <Navigation />
            <StatusBar style="dark" />
          </AlertProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
}
