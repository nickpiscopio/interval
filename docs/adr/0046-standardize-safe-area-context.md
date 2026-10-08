# 46. Standardize Safe Area Insets and Views on react-native-safe-area-context

We decided to standardize all modal and screen safe area boundaries exclusively on `react-native-safe-area-context`, eliminating all usages of React Native's deprecated built-in `SafeAreaView`. This removes framework deprecation warnings, provides consistent edge-to-edge inset handling across Android and iOS devices, and future-proofs the codebase against removal in upcoming React Native releases.
