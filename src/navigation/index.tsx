/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import SelectTimerScreen from "../screens/SelectTimerScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import CreateTimerScreen from "../screens/CreateTimerScreen";
import TimerScreen from "../screens/TimerScreen";
import GenerateTimerScreen from "../screens/GenerateTimerScreen";
import CompletionScreen from "../screens/CompletionScreen";

export default function Navigation() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: "center", presentation: "formSheet" }}
    >
      <Stack.Screen
        name="Root"
        component={SelectTimerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTimer"
        component={CreateTimerScreen}
        options={{ title: "Create Timer" }}
      />
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GenerateTimer"
        component={GenerateTimerScreen}
        options={{ title: "Generate Timer" }}
      />
      <Stack.Screen
        name="Completion"
        component={CompletionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}
