import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Spacing, { RADIUS, TOUCH_TARGET, SHADOWS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  icon?: "warning" | "error" | "trash" | "info" | "success" | "help";
  buttons?: AlertButton[];
  cancelable?: boolean;
}

interface CustomAlertModalProps {
  visible: boolean;
  options: AlertOptions | null;
  onDismiss: () => void;
}

const MAX_ALERT_WIDTH = 340;
const MAX_ALERT_HEIGHT_RATIO = 0.85;

export function CustomAlertModal({
  visible,
  options,
  onDismiss,
}: CustomAlertModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback when alert pops up
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !options) {
    return null;
  }

  const {
    title,
    message,
    icon = "info",
    buttons = [{ text: "OK", style: "default" }],
    cancelable = true,
  } = options;

  // Derive icon configuration
  function getIconConfig() {
    switch (icon) {
      case "trash":
        return {
          name: "trash-outline" as const,
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
      case "warning":
        return {
          name: "alert-circle-outline" as const,
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      case "error":
        return {
          name: "close-circle-outline" as const,
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
      case "success":
        return {
          name: "checkmark-circle-outline" as const,
          color: "#10B981",
          bgColor: "#D1FAE5",
        };
      case "help":
        return {
          name: "help-circle-outline" as const,
          color: "#3B82F6",
          bgColor: "#DBEAFE",
        };
      case "info":
      default:
        return {
          name: "information-circle-outline" as const,
          color: "#3B82F6",
          bgColor: "#DBEAFE",
        };
    }
  }

  const iconConfig = getIconConfig();

  function handleBackdropPress() {
    if (!cancelable) return;
    const cancelBtn = buttons.find((b) => b.style === "cancel");
    if (cancelBtn && cancelBtn.onPress) {
      cancelBtn.onPress();
    }
    onDismiss();
  }

  function handleButtonPress(btn: AlertButton) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
    if (btn.onPress) {
      btn.onPress();
    }
  }

  const isTwoButtons = buttons.length === 2;
  const paddingLeft = insets.left + Spacing.lg;
  const paddingRight = insets.right + Spacing.lg;
  const availableWidth = Math.max(0, windowWidth - paddingLeft - paddingRight);
  const cardWidth = Math.min(MAX_ALERT_WIDTH, availableWidth);
  const safeViewportHeight = Math.max(0, windowHeight - insets.top - insets.bottom);
  const maxCardHeight = safeViewportHeight * MAX_ALERT_HEIGHT_RATIO;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}
        >
          <Pressable
            testID="custom-alert-backdrop"
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <View
          testID="custom-alert-card-container"
          pointerEvents="box-none"
          style={[
            styles.cardContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft,
              paddingRight,
            },
          ]}
        >
          <Animated.View
            testID="custom-alert-card"
            style={[
              styles.alertCard,
              {
                width: cardWidth,
                maxWidth: MAX_ALERT_WIDTH,
                maxHeight: maxCardHeight,
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Pinned Header: Contextual Icon Bubble & Title */}
            <View testID="custom-alert-header" style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
                <Ionicons name={iconConfig.name} size={32} color={iconConfig.color} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Scrollable Message Body */}
            {message ? (
              <ScrollView
                testID="custom-alert-message-scroll"
                style={styles.messageScroll}
                contentContainerStyle={styles.messageScrollContent}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                <Text style={styles.message}>{message}</Text>
              </ScrollView>
            ) : null}

            {/* Pinned Action Buttons */}
            <View
              testID="custom-alert-buttons"
              style={[
                styles.buttonContainer,
                !message && styles.buttonContainerNoMessage,
                isTwoButtons && styles.buttonContainerRow,
              ]}
            >
              {buttons.map((btn, index) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";

                let btnStyle = styles.defaultButton;
                let textStyle = styles.defaultButtonText;

                if (isDestructive) {
                  btnStyle = styles.destructiveButton;
                  textStyle = styles.destructiveButtonText;
                } else if (isCancel) {
                  btnStyle = styles.cancelButton;
                  textStyle = styles.cancelButtonText;
                }

                return (
                  <TouchableOpacity
                    key={`${btn.text}-${index}`}
                    style={[
                      styles.baseButton,
                      btnStyle,
                      isTwoButtons && styles.twoButtonFlex,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleButtonPress(btn)}
                  >
                    <Text style={[styles.baseButtonText, textStyle]}>{btn.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: Colors.surface.overlay,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alertCard: {
    maxWidth: MAX_ALERT_WIDTH,
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    ...SHADOWS.modal,
  },
  header: {
    width: "100%",
    alignItems: "center",
    flexShrink: 0,
  },
  iconContainer: {
    width: TOUCH_TARGET.cta,
    height: TOUCH_TARGET.cta,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lineHeight.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textScale.primary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  messageScroll: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: Spacing.lg,
  },
  messageScrollContent: {
    flexGrow: 0,
    paddingHorizontal: Spacing.xs,
  },
  message: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm + 2,
    fontFamily: "Poppins-Regular",
    color: Colors.textScale.secondary,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    flexShrink: 0,
    gap: Spacing.sm,
  },
  buttonContainerNoMessage: {
    marginTop: Spacing.md,
  },
  buttonContainerRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  twoButtonFlex: {
    flex: 1,
  },
  baseButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: TOUCH_TARGET.min,
  },
  baseButtonText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
  },
  defaultButton: {
    backgroundColor: Colors.primary,
  },
  defaultButtonText: {
    color: Colors.white,
  },
  destructiveButton: {
    backgroundColor: Colors.destructive,
  },
  destructiveButtonText: {
    color: Colors.white,
  },
  cancelButton: {
    backgroundColor: Colors.neutralAction.surface,
  },
  cancelButtonText: {
    color: Colors.neutralAction.text,
  },
});
