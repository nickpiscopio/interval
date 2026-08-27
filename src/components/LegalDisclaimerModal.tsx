import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text } from "./Themed";
import Colors from "../constants/Colors";
import Spacing, { RADIUS } from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import { t } from "../i18n";

export interface LegalDisclaimerModalProps {
  visible: boolean;
  mode?: "gate" | "review";
  appVersion?: string;
  acceptedDate?: string | null;
  onAccept?: () => void;
  onClose?: () => void;
}

export function LegalDisclaimerModal({
  visible,
  mode = "gate",
  appVersion = "1.0.0",
  acceptedDate,
  onAccept,
  onClose,
}: LegalDisclaimerModalProps) {
  function handleAccept() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onAccept) {
      onAccept();
    }
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) {
      onClose();
    }
  }

  const isGate = mode === "gate";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle={isGate ? "fullScreen" : "pageSheet"}
      onRequestClose={isGate ? () => {} : handleClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.badgesRow}>
            <View style={styles.warningBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#DC2626" />
              <Text style={styles.warningBadgeText}>
                {t("legal.badgeWarning")}
              </Text>
            </View>

            {!isGate && acceptedDate && (
              <View style={styles.agreedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.agreedBadgeText}>
                  {t("legal.agreedOnDate", { date: acceptedDate })}
                </Text>
              </View>
            )}
          </View>

          {!isGate && (
            <TouchableOpacity
              testID="legal-modal-close-btn"
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{t("legal.title")}</Text>
          <Text style={styles.subtitle}>{t("legal.subtitle")}</Text>
        </View>

        {/* Scrollable Legal Sections */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Assumption of Risk */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="hand-left" size={18} color="#DC2626" />
              </View>
              <Text style={styles.cardTitle}>
                {t("legal.assumptionOfRiskTitle")}
              </Text>
            </View>
            <Text style={styles.cardBody}>
              {t("legal.assumptionOfRiskBody")}
            </Text>
          </View>

          {/* Section 2: AI & PT Recommendations */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="sparkles" size={18} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>
                {t("legal.recommendationsTitle")}
              </Text>
            </View>
            <Text style={styles.cardBody}>
              {t("legal.recommendationsBody")}
            </Text>
          </View>

          {/* Section 3: Physician Consultation */}
          <View style={[styles.card, styles.highlightCard]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="medkit" size={18} color="#059669" />
              </View>
              <Text style={styles.cardTitle}>
                {t("legal.physicianConsultationTitle")}
              </Text>
            </View>
            <Text style={styles.cardBody}>
              {t("legal.physicianConsultationBody")}
            </Text>
          </View>

          {/* Section 4: Limitation of Liability */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="alert-circle" size={18} color="#D97706" />
              </View>
              <Text style={styles.cardTitle}>
                {t("legal.liabilityTitle")}
              </Text>
            </View>
            <Text style={styles.cardBody}>
              {t("legal.liabilityBody")}
            </Text>
          </View>

          {/* Version / Attribution Info in Review Mode */}
          {!isGate && (
            <View style={styles.versionWrap}>
              <Text style={styles.versionText}>
                {t("legal.appVersionLabel", { version: appVersion })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions (Only in Gate Mode) */}
        {isGate && (
          <View style={styles.footer}>
            <Text style={styles.termsNoticeText}>
              {t("legal.termsNotice")}
            </Text>
            <TouchableOpacity
              testID="legal-agree-button"
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleAccept}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {t("legal.agreeButton")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.xs,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  agreedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  agreedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: "#6B7280",
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  highlightCard: {
    borderColor: "#A7F3D0",
    backgroundColor: "#F0FDF4",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: "700",
    color: "#111827",
  },
  cardBody: {
    fontSize: FontSize.sm,
    color: "#4B5563",
    lineHeight: 20,
  },
  versionWrap: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  termsNoticeText: {
    fontSize: FontSize.xs,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: RADIUS.lg,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
});
