# 12. Stack Card Navigation and Dynamic Headers

We decided to adopt standard push card navigation (`presentation: "card"`, `animation: "slide_from_right"`) globally across the application's root stack navigator instead of modal form sheets.

1. **Navigation Paradigm**: Replaced modal bottom-sheet presentation with standard hierarchical push/pop navigation, enabling native forward slide-in transitions and back swipe gestures.
2. **Dynamic Contextual Headers**: The `CreateTimerScreen` dynamically reflects the timer's current name in the navigation header in real time as the user edits it.
3. **Fallback Header State**: If the timer name is empty, unsaved/imported timers display "Create Timer" while existing saved timers display "Edit Timer".
4. **Name Validation**: A timer must have a non-empty name before it can be saved, providing domain-aligned validation feedback to the user.
