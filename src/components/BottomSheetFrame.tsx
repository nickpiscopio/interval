import React, { useCallback, useEffect, useRef } from "react";
import { BackHandler, Dimensions, StyleSheet, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Spacing, { RADIUS, SHADOWS } from "../constants/Spacing";
import Colors from "../constants/Colors";

export const SHEET_MAX_HEIGHT_RATIO = 0.9;

export interface BottomSheetFrameProps {
  /** Whether the sheet is presented. */
  visible: boolean;
  /** Called when the sheet is dismissed via backdrop tap or Android back. */
  onClose: () => void;
  /** Optional snap points (e.g. ["90%"]). Disables dynamic sizing when provided. */
  snapPoints?: (string | number)[];
  children: React.ReactNode;
}

/**
 * The app's bottom sheet standard (ADR 0016 §6): no drag handle, no swipe
 * gestures, automatic sizing capped at 90% of screen height (or explicit snap points),
 * 16px padding, and Android back dismissal. Sheets render their own headers as children.
 */
export function BottomSheetFrame({
  visible,
  onClose,
  snapPoints,
  children,
}: BottomSheetFrameProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const backReportedRef = useRef(false);
  const isDismissingProgrammatically = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      isDismissingProgrammatically.current = false;
      sheetRef.current?.present();
    } else {
      isDismissingProgrammatically.current = true;
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    // Handlers registered later run first, so the topmost sheet closes only.
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      backReportedRef.current = true;
      sheetRef.current?.dismiss();
      onCloseRef.current();
      return true;
    });
    return () => subscription.remove();
  }, [visible]);

  const handleDismiss = useCallback(() => {
    // A back press already reported the close; skip the follow-up dismiss event.
    if (backReportedRef.current) {
      backReportedRef.current = false;
      return;
    }
    // A programmatic dismissal (visible became false) already triggered the close; skip duplicate event.
    if (isDismissingProgrammatically.current) {
      isDismissingProgrammatically.current = false;
      return;
    }
    onCloseRef.current();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const hasExplicitSnapPoints = Boolean(snapPoints && snapPoints.length > 0);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing={!hasExplicitSnapPoints}
      maxDynamicContentSize={
        hasExplicitSnapPoints
          ? undefined
          : Dimensions.get("window").height * SHEET_MAX_HEIGHT_RATIO
      }
      snapPoints={hasExplicitSnapPoints ? snapPoints : undefined}
      handleComponent={null}
      enablePanDownToClose={false}
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      stackBehavior="push"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {hasExplicitSnapPoints ? (
        <View
          testID="bottom-sheet-content"
          style={[
            styles.content,
            styles.fullHeight,
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          {children}
        </View>
      ) : (
        <BottomSheetView
          testID="bottom-sheet-content"
          style={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.surface.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOWS.modal,
  },
  content: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  fullHeight: {
    flex: 1,
  },
});

