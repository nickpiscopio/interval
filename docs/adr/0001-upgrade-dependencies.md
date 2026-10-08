# Upgrade to Expo SDK 57 and React Navigation v7

We upgraded the project to Expo SDK 57, React 19.2, React Native 0.86, and React Navigation v7 to maintain parity with the installed mobile Expo Go client and resolve security vulnerabilities. We aligned native modules via Expo CLI, configured `@react-native/jest-preset@0.86.3` to maintain full test suite coverage, and migrated `StyleSheet.absoluteFillObject` references to `StyleSheet.absoluteFill`.
