# 45. Snappy Reorder Physics and Continuous Shadow Interpolation

We decided to optimize the drag-and-drop reordering lifecycle by establishing high-stiffness spring physics and continuous real-time shadow elevation interpolation across both `SelectTimerScreen` and `CreateTimerScreen`.

## Context
When reordering timer cards on `SelectTimerScreen` or intervals on `CreateTimerScreen`:
1. The default spring configuration of `react-native-draggable-flatlist` (`stiffness: 100`, `damping: 20`, `overshootClamping: false`) had low rest thresholds, creating a sluggish 400–600ms oscillation upon release before `onDragEnd` fired to persist changes to `AsyncStorage`.
2. Card elevation shadows were toggled via boolean React state (`isActive && styles.cardDragging`), causing the shadow blur to abruptly snap down from 12px to 4px instead of transitioning smoothly during the drop.

## Decision
1. **Design System Reorder Spring Token (`REORDER_SPRING_CONFIG`)**:
   - Established tuned, balanced spring physics in `src/constants/Spacing.ts`:
     ```ts
     export const REORDER_SPRING_CONFIG = {
       damping: 24,
       mass: 0.15,
       stiffness: 180,
       overshootClamping: true,
       restSpeedThreshold: 0.5,
       restDisplacementThreshold: 0.5,
     } as const;
     ```
   - Configured `animationConfig={REORDER_SPRING_CONFIG}` on `<DraggableFlatList>` in `SelectTimerScreen` and `CreateTimerScreen`.
   - Neighboring items glide smoothly out of the way without sudden jerks when hovered, and releasing an item settles crisply in ~140ms, immediately triggering `onDragEnd` and persistence.

2. **Flicker-Free Render Architecture**:
   - **Memoized Callbacks**: Wrapped `renderTimerCard` and `renderIntervalItem` in `useCallback` to maintain stable references between renders.
   - **Guarded Scroll State Updates**: Guarded `setIsScrolled` and `setHasMoreBelow` in `onScroll` and `onScrollOffsetChange` to only invoke state updates when boolean values actually toggle (`prev !== next`), terminating the high-frequency re-render storm during drag scrolling.
   - **GPU-Accelerated ScaleDecorator**: Relied on `ScaleDecorator activeScale={1.03}` without conflicting nested shadow decorators (`ShadowDecorator`), preventing rasterization and Z-fighting shadow flicker on iOS and Android.
   - **Persistent Cell Identity**: Passed `extraData` to `<DraggableFlatList>` to ensure cell identity remains completely stable throughout drag operations.

## Consequences
- Items snap into their destination slot immediately upon release and save instantly without any perceived delay.
- Elevation and drop shadows float up on touch and glide seamlessly back into resting surface elevation on drop.
