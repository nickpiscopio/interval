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
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import * as React from "react";

import { t } from "../i18n";
import SelectTimerScreen from "../screens/SelectTimerScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import CreateTimerScreen from "../screens/CreateTimerScreen";
import TimerScreen from "../screens/TimerScreen";
import GenerateTimerScreen from "../screens/GenerateTimerScreen";
import CompletionScreen from "../screens/CompletionScreen";
import AwardsScreen from "../screens/AwardsScreen";

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
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "card",
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        cardStyle: { backgroundColor: "#F9FAFB" },
      }}
    >
      <Stack.Screen name="Root" component={SelectTimerScreen} />
      <Stack.Screen name="CreateTimer" component={CreateTimerScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="GenerateTimer" component={GenerateTimerScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
      <Stack.Screen name="Awards" component={AwardsScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}
