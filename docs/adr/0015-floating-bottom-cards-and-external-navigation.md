# 15. Floating Bottom Cards and External Navigation

We decided to style the bottom editor panels as distinct floating cards and move card navigation controls and pagination indicators outside the cards into a unified bottom bar.

1. **Floating Card Aesthetics**: "Timer Details" and "Edit Selected Interval" are styled as discrete elevated cards with rounded borders and drop shadows, visually distinct from the screen background and bottom-aligned (`justifyContent: "flex-end"`) to share a uniform baseline above the navigation controls.
2. **External Card Navigation & Indicators**:
   - Navigation buttons ("Edit Selected Interval ➔" and "⬅ Timer Details") use subdued neutral gray styling (`#6B7280`) positioned tight against the bottom edge of the cards.
   - Page indicators use circular dots (without pill stretching), where the active card is rendered slightly darker (`#6B7280`) than the inactive card (`#D1D5DB`).
   - Contextual visibility: The right forward button appears only on Card 1; the left return button appears only on Card 2; dots remain centered.
3. **Safe Area Elevation**: The bottom navigation bar is automatically padded with safe area insets to stay clear of the device's home bar.
