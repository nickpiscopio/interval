# 19. Docked Bottom Editor Panel

We decided to transition the "Timer Details" and "Edit Selected Interval" bottom carousel from a floating absolute overlay into a docked flex panel.

1. **Flex Split Viewport**:
   - The interval sequence list (`DraggableFlatList`) is wrapped in a `flex: 1` container positioned above the bottom editor panel.
   - The list scrolling area ends directly above the top edge of the cards, ensuring no intervals can ever be hidden or obscured underneath the cards.

2. **Auto-Scroll Behavior**:
   - Adding or duplicating an interval automatically scrolls the sequence list to reveal the newly created item while transitioning the editor carousel to the active interval card.

3. **Docked Aesthetics & Safe Area Insets**:
   - Retained the elevated card aesthetics, external navigation links, and circular pagination dots, docking the container above the bottom safe area insets.
