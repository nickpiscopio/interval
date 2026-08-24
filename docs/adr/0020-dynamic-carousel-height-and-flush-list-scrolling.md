# 20. Stationary Bottom Cards and Dynamic List Viewport

We decided to keep the bottom editor cards and navigation bar stationary at the bottom of the screen while dynamically interpolating the interval sequence list's bottom boundary (`marginBottom`) to meet the active card's top edge.

1. **Stationary Bottom-Anchored Cards**:
   - `bottomContainer` is anchored to the bottom of the screen (`position: "absolute", bottom: 0, left: 0, right: 0`).
   - Cards are bottom-aligned (`justifyContent: "flex-end"`), ensuring that neither card nor the bottom navigation controls move vertically during horizontal swipe transitions.

2. **Top-Anchored List with Dynamic Bottom Margin**:
   - The interval sequence list (`DraggableFlatList`) remains top-anchored, keeping scroll placement and items constant relative to the top of the screen.
   - The list container's bottom margin (`marginBottom`) dynamically interpolates based on `scrollX` from `card1BottomOffset` to `card2BottomOffset`.
   - On Card 1 (Timer Details), the list extends lower down; on Card 2 (Edit Selected Interval), the list stops higher up, eliminating dead whitespace while ensuring intervals scroll flush to the active card's top edge.
