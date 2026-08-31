# 12. Stack Card Navigation and Dynamic In-Screen Headers

We decided to adopt JavaScript-coordinated stack card navigation (`@react-navigation/stack` with `CardStyleInterpolators.forHorizontalIOS`, `cardStyle: { backgroundColor: "#F9FAFB" }`, `gestureEnabled: true`) and global in-screen headers (`headerShown: false`) across the application's root stack navigator instead of native Fragment stack unmounting.

1. **Navigation Paradigm & Complete Visual Persistence**: Replaced `@react-navigation/native-stack` with `@react-navigation/stack`. Because `@react-navigation/stack` buffers scenes and delays component unmounting until the exit slide animation has reached 100% completion, the content on the dismissed screen remains 100% rendered and visible until it completely slides off the viewport.
2. **Dynamic In-Screen Headers**: Screen headers (`CreateTimerScreen`, `GenerateTimerScreen`, `AwardsScreen`) feature standardized back buttons, accessible hit targets, and real-time dynamic titles (reflecting custom timer names as the user edits them).
3. **Fallback Header State**: If the timer name is empty, unsaved/imported timers display "Create Timer" while existing saved timers display "Edit Timer".
4. **Name Validation**: A timer must have a non-empty name before it can be saved, providing domain-aligned validation feedback to the user.
