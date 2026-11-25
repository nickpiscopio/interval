import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/Colors";
import FontSize, { FONT_FAMILY, LINE_HEIGHT } from "../constants/FontSize";
import Spacing, { RADIUS, SHADOWS, TOUCH_TARGET } from "../constants/Spacing";
import { t } from "../i18n";
import {
  logBreadcrumb,
  recordNonFatalError,
} from "../services/crashlyticsService";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (errorInfo.componentStack) {
      logBreadcrumb(`ErrorBoundary: ${errorInfo.componentStack.trim()}`);
    }
    recordNonFatalError(error, "ErrorBoundary");
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary-fallback">
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="alert-circle"
                size={48}
                color={Colors.destructive}
              />
            </View>
            <Text style={styles.title}>{t("errorBoundary.title")}</Text>
            <Text style={styles.message}>{t("errorBoundary.message")}</Text>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={this.handleReset}
              accessibilityRole="button"
              testID="error-boundary-retry-button"
            >
              <Text style={styles.buttonText}>
                {t("errorBoundary.tryAgain")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.screen,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.screen,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.surface.card,
    borderRadius: RADIUS.md,
    padding: Spacing.md,
    alignItems: "center",
    ...SHADOWS.card,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "700",
    fontSize: FontSize.xl,
    lineHeight: LINE_HEIGHT.xl,
    color: Colors.textScale.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FontSize.md,
    lineHeight: LINE_HEIGHT.md,
    color: Colors.textScale.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    width: "100%",
    minHeight: TOUCH_TARGET.cta,
    backgroundColor: Colors.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "700",
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
