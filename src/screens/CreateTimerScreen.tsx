import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { RootStackScreenProps } from "../types";
import { Timer } from "../model/Timer";
import { Interval, generateIntervalId, normalizeInterval } from "../model/Interval";
import { t } from "../i18n";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";

const STORAGE_KEY = "@hiit_timers";
const COLOR_PALETTE = [
  "#1ACC6C", // Green
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8338EC", // Purple
  "#E63946", // Red
  "#F95738", // Orange
  "#F9C74F"  // Yellow
];

export default function CreateTimerScreen({
  route,
  navigation,
}: RootStackScreenProps<"CreateTimer">) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<ScrollView>(null);
  const listRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [card1Height, setCard1Height] = useState<number>(180);
  const [card2Height, setCard2Height] = useState<number>(240);
  const [navBarHeight, setNavBarHeight] = useState<number>(44);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  const editTimer = route.params?.timer;
  const isImportMode = Boolean(editTimer && editTimer.id.startsWith("ai_") && !editTimer.createdAt);

  // Form State
  const [timerName, setTimerName] = useState("");
  const [rounds, setRounds] = useState(3);
  const [intervals, setIntervals] = useState<Interval[]>([
    { id: "init_1", name: "High Interval", duration: 30, color: "#1ACC6C" },
    { id: "init_2", name: "Low Interval", duration: 15, color: "#3B82F6" }
  ]);
  const [selectedIntervalId, setSelectedIntervalId] = useState<string>("init_1");

  // Initialize form if in edit/import mode
  useEffect(() => {
    if (editTimer) {
      setTimerName(editTimer.name);
      setRounds(editTimer.rounds);
      const normalized = editTimer.intervals.map((int, idx) => normalizeInterval(int, idx));
      setIntervals(normalized);
      if (normalized.length > 0) {
        setSelectedIntervalId(normalized[0].id);
      }
    } else {
      setTimerName("");
      setRounds(3);
      const initial: Interval[] = [
        { id: generateIntervalId(), name: "High Interval", duration: 30, color: "#1ACC6C" },
        { id: generateIntervalId(), name: "Low Interval", duration: 15, color: "#3B82F6" }
      ];
      setIntervals(initial);
      setSelectedIntervalId(initial[0].id);
    }
  }, [editTimer]);

  // Dynamic Navigation Header Title
  useEffect(() => {
    const isSaved = Boolean(editTimer && editTimer.createdAt && !isImportMode);
    const fallbackTitle = isSaved ? t("createTimer.titleEdit") : t("createTimer.titleCreate");
    const trimmed = timerName.trim();
    navigation.setOptions({
      title: trimmed.length > 0 ? timerName : fallbackTitle,
    });
  }, [navigation, timerName, editTimer, isImportMode]);

  const bottomInset = Math.max(insets.bottom, Spacing.sm);
  const card1BottomOffset = card1Height + navBarHeight + bottomInset;
  const card2BottomOffset = card2Height + navBarHeight + bottomInset;

  const dynamicListBottomMargin = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [card1BottomOffset, card2BottomOffset],
    extrapolate: "clamp",
  });

  const selectedInterval = intervals.find((int) => int.id === selectedIntervalId) || intervals[0];

  // Navigate to Card
  function scrollToCard(index: number) {
    if (selectedInterval && selectedInterval.duration < 1) {
      updateSelectedInterval({ duration: 1 });
    }
    setActiveCardIndex(index);
    carouselRef.current?.scrollTo({ x: index * width, animated: true });
  }

  // Action: Select Interval (animates carousel to Interval Details)
  function handleSelectInterval(id: string) {
    setSelectedIntervalId(id);
    scrollToCard(1);
  }

  // Action: Add Interval (animates carousel to Interval Details)
  function addInterval() {
    const newInterval: Interval = {
      id: generateIntervalId(),
      name: t("createTimer.addInterval"),
      duration: 30,
      color: COLOR_PALETTE[intervals.length % COLOR_PALETTE.length]
    };
    const newIntervals = [...intervals, newInterval];
    setIntervals(newIntervals);
    setSelectedIntervalId(newInterval.id);
    scrollToCard(1);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }

  // Action: Update Selected Interval Properties
  function updateSelectedInterval(fields: Partial<Interval>) {
    if (!selectedInterval) return;
    setIntervals((prev) =>
      prev.map((int) => (int.id === selectedInterval.id ? { ...int, ...fields } : int))
    );
  }

  // Action: Duplicate Interval
  function duplicateSelectedInterval() {
    if (!selectedInterval) return;
    const index = intervals.findIndex((int) => int.id === selectedInterval.id);
    if (index === -1) return;
    const duplicated: Interval = {
      id: generateIntervalId(),
      name: `${selectedInterval.name} (Copy)`,
      duration: selectedInterval.duration,
      color: selectedInterval.color,
      exerciseId: selectedInterval.exerciseId
    };
    const updated = [...intervals];
    updated.splice(index + 1, 0, duplicated);
    setIntervals(updated);
    setSelectedIntervalId(duplicated.id);
    setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      } catch {
        listRef.current?.scrollToEnd({ animated: true });
      }
    }, 50);
  }

  // Action: Delete Selected Interval
  function deleteSelectedInterval() {
    if (intervals.length <= 1) {
      Alert.alert(t("common.appName"), t("createTimer.validationIntervalRequired"));
      return;
    }
    const index = intervals.findIndex((int) => int.id === selectedInterval?.id);
    const updated = intervals.filter((int) => int.id !== selectedInterval?.id);
    setIntervals(updated);
    const fallbackIdx = Math.max(0, Math.min(index, updated.length - 1));
    setSelectedIntervalId(updated[fallbackIdx].id);
  }

  // Save Timer to local database
  async function saveTimer() {
    if (!timerName.trim()) {
      Alert.alert(t("common.appName"), t("createTimer.validationNameRequired"));
      return;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let savedTimers: Timer[] = data ? JSON.parse(data) : [];

      const timerToSave: Timer = {
        id: editTimer?.id || `timer_${Date.now()}`,
        name: timerName.trim(),
        rounds,
        intervals,
        createdAt: editTimer?.createdAt || Date.now()
      };

      if (editTimer) {
        // Update existing timer
        savedTimers = savedTimers.map((t) => (t.id === timerToSave.id ? timerToSave : t));
        // If it was a shared timer we are importing, it might not exist yet:
        if (!savedTimers.some((t) => t.id === timerToSave.id)) {
          savedTimers.push(timerToSave);
        }
      } else {
        // Add new timer
        savedTimers.push(timerToSave);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedTimers));
      navigation.popToTop();
    } catch (e) {
      console.warn("Failed to save timer:", e);
    }
  }

  // Start Timer directly from Timer Details
  function startTimer() {
    if (!timerName.trim()) {
      Alert.alert(t("common.appName"), t("createTimer.validationNameRequired"));
      return;
    }

    const mappedIntervals = intervals.map((int) => ({
      ...int,
      durationLeftInMillis: int.duration * 1000,
      totalDuration: int.duration * 1000,
    }));

    navigation.navigate("Timer", {
      timer: {
        id: editTimer?.id || "temp",
        name: timerName.trim(),
        rounds: rounds,
        intervals: mappedIntervals,
        createdAt: Date.now(),
      },
    });
  }

  // Delete entire Timer
  async function deleteTimer() {
    if (!editTimer) return;
    
    Alert.alert(
      t("createTimer.deleteConfirmTitle"),
      t("createTimer.deleteConfirmMessage", { name: timerName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem(STORAGE_KEY);
              if (data) {
                const parsed = JSON.parse(data) as Timer[];
                const filtered = parsed.filter((t) => t.id !== editTimer.id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              }
              navigation.popToTop();
            } catch (e) {
              console.warn("Failed to delete timer:", e);
            }
          }
        }
      ]
    );
  }

  // Handle Carousel Paging
  function handleCarouselScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    if (pageIndex !== activeCardIndex && (pageIndex === 0 || pageIndex === 1)) {
      setActiveCardIndex(pageIndex);
    }
  }

  // Format seconds to display string (e.g. 5s, 1m 30s)
  function formatSeconds(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Format seconds into HH:MM:SS string
  function formatHHMMSS(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Handle Right-to-Left HH:MM:SS typing
  function handleDurationChange(rawText: string) {
    const cleanDigits = rawText.replace(/\D/g, "");
    const trimmed = cleanDigits.slice(-6);
    const padded = trimmed.padStart(6, "0");
    const h = parseInt(padded.slice(0, 2), 10) || 0;
    const m = parseInt(padded.slice(2, 4), 10) || 0;
    const s = parseInt(padded.slice(4, 6), 10) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;
    updateSelectedInterval({ duration: totalSeconds });
  }

  // Clamp duration to minimum 1s on blur
  function handleDurationBlur() {
    if (selectedInterval && selectedInterval.duration < 1) {
      updateSelectedInterval({ duration: 1 });
    }
  }

  const renderIntervalItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Interval>) => {
    const isSelected = item.id === selectedInterval?.id;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSelectInterval(item.id)}
          style={[
            styles.intervalItem,
            isSelected && styles.intervalItemActive,
            isActive && styles.intervalItemDragging,
            { borderLeftColor: item.color },
          ]}
        >
          {/* 6-Dot Drag Handle inside on the Far Left */}
          <TouchableOpacity
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              drag();
            }}
            style={styles.intervalDragHandle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons
              name="drag-indicator"
              size={20}
              color={isActive ? Colors.primary : Colors.textScale.muted}
            />
          </TouchableOpacity>

          <View style={styles.intervalInfo}>
            <Text style={styles.intervalName}>{item.name}</Text>
          </View>
          <Text style={styles.intervalDuration}>{formatSeconds(item.duration)}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      {/* Header Banner */}
      {isImportMode && (
        <View style={styles.importBanner}>
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.importBannerText}>Review & Import Shared Timer</Text>
        </View>
      )}

      {/* Interval Draggable List Area */}
      <Animated.View style={[styles.listContainer, { marginBottom: dynamicListBottomMargin }]}>
        <DraggableFlatList
          ref={listRef}
          data={intervals}
          keyExtractor={(item) => item.id}
          onDragBegin={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onDragEnd={({ data }) => {
            setIntervals(data);
          }}
          renderItem={renderIntervalItem}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <View style={styles.intervalListHeader}>
              <Text style={styles.sectionTitle}>{t("createTimer.intervals")}</Text>
              <TouchableOpacity style={styles.addIntervalLink} onPress={addInterval}>
                <Ionicons name="add-circle" size={18} color={Colors.primary} />
                <Text style={styles.addIntervalLinkText}>{t("createTimer.addInterval")}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Animated.View>

      {/* Bottom Fixed-Anchor Cards Carousel & Navigation Panel */}
      <View style={[styles.bottomContainer, { paddingBottom: bottomInset }]}>
        <View style={{ height: Math.max(card1Height, card2Height) }}>
          <Animated.ScrollView
            ref={carouselRef as any}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false, listener: handleCarouselScroll }
            )}
            scrollEventThrottle={16}
            style={styles.carouselScrollView}
            contentContainerStyle={styles.carouselContentContainer}
          >
            {/* Card 1: Timer Details */}
            <View style={[styles.cardPage, { width }]}>
              <View
                style={styles.card}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h > 0 && Math.abs(h - card1Height) > 1) {
                    setCard1Height(h);
                  }
                }}
              >
                <Text style={styles.cardTitle}>{t("createTimer.titleCreate")}</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("common.appName")} Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={timerName}
                      onChangeText={setTimerName}
                      placeholder={t("createTimer.namePlaceholder")}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 0.38 }]}>
                    <Text style={styles.inputLabel}>{t("createTimer.rounds")}</Text>
                    <View style={styles.roundsControl}>
                      <TouchableOpacity
                        onPress={() => setRounds(Math.max(1, rounds - 1))}
                        style={styles.roundAdjustButton}
                      >
                        <Ionicons name="remove" size={16} color="#4B5563" />
                      </TouchableOpacity>
                      <Text style={styles.roundsValue}>{rounds}</Text>
                      <TouchableOpacity
                        onPress={() => setRounds(rounds + 1)}
                        style={styles.roundAdjustButton}
                      >
                        <Ionicons name="add" size={16} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Timer Icon-Only Actions */}
                <View style={styles.timerActions}>
                  {editTimer && !isImportMode && (
                    <TouchableOpacity onPress={deleteTimer} style={styles.deleteIconButton}>
                      <Ionicons name="trash-outline" size={22} color="#E63946" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={saveTimer} style={styles.saveIconButton}>
                    <Ionicons
                      name={isImportMode ? "download-outline" : "bookmark-outline"}
                      size={22}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={startTimer} style={styles.startIconButton}>
                    <Ionicons name="play" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card 2: Edit Selected Interval */}
            <View style={[styles.cardPage, { width }]}>
              <View
                style={styles.card}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h > 0 && Math.abs(h - card2Height) > 1) {
                    setCard2Height(h);
                  }
                }}
              >
                <Text style={styles.cardTitle}>{t("createTimer.titleEdit")}</Text>

                {selectedInterval ? (
                  <>
                    <View style={styles.editorInputRow}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t("createTimer.intervalNamePlaceholder")}</Text>
                        <TextInput
                          style={styles.editorTextInput}
                          value={selectedInterval.name}
                          onChangeText={(name) => updateSelectedInterval({ name })}
                          placeholder={t("createTimer.intervalNamePlaceholder")}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 0.55 }]}>
                        <Text style={styles.inputLabel}>{t("common.duration")}</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={formatHHMMSS(selectedInterval.duration)}
                          onChangeText={handleDurationChange}
                          onBlur={handleDurationBlur}
                          keyboardType="number-pad"
                          selectTextOnFocus
                        />
                      </View>
                    </View>

                    <Text style={styles.label}>{t("createTimer.intervals")} Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                      {COLOR_PALETTE.map((color) => {
                        const isSelected = selectedInterval.color === color;
                        return (
                          <TouchableOpacity
                            key={color}
                            onPress={() => updateSelectedInterval({ color })}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              isSelected && styles.colorOptionSelected
                            ]}
                          >
                            {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Interval Icon-Only Actions */}
                    <View style={styles.intervalActions}>
                      <TouchableOpacity onPress={deleteSelectedInterval} style={styles.deleteIconButton}>
                        <Ionicons name="trash-outline" size={22} color="#E63946" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={duplicateSelectedInterval} style={styles.duplicateIconButton}>
                        <Ionicons name="copy-outline" size={22} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noIntervalText}>{t("createTimer.validationIntervalRequired")}</Text>
                )}
              </View>
            </View>
          </Animated.ScrollView>
        </View>

        {/* External Bottom Navigation & Indicators Bar */}
        <View
          style={styles.bottomNavBar}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - navBarHeight) > 1) {
              setNavBarHeight(h);
            }
          }}
        >
          {/* Left: Timer Details link when on Card 2 */}
          <View style={styles.navSideContainer}>
            {activeCardIndex === 1 ? (
              <TouchableOpacity
                onPress={() => scrollToCard(0)}
                style={styles.navButtonLeft}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={16} color="#6B7280" />
                <Text style={styles.navButtonText}>{t("createTimer.titleCreate")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center: Circular Pagination Dots */}
          <View style={styles.paginationDots}>
            <TouchableOpacity
              onPress={() => scrollToCard(0)}
              style={[styles.dot, activeCardIndex === 0 ? styles.dotActive : styles.dotInactive]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
            <TouchableOpacity
              onPress={() => scrollToCard(1)}
              style={[styles.dot, activeCardIndex === 1 ? styles.dotActive : styles.dotInactive]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          </View>

          {/* Right: Edit Selected Interval link when on Card 1 */}
          <View style={styles.navSideContainer}>
            {activeCardIndex === 0 ? (
              <TouchableOpacity
                onPress={() => scrollToCard(1)}
                style={styles.navButtonRight}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.navButtonText}>{t("createTimer.titleEdit")}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    flex: 1,
  },
  importBanner: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  importBannerText: {
    color: "#FFFFFF",
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Bold",
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.lineHeight.md,
    fontFamily: "Poppins-Bold",
    color: "#374151",
  },
  intervalListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addIntervalLink: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Spacing.touchTarget.min,
    gap: Spacing.xs,
  },
  addIntervalLinkText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  intervalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.sm,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    marginBottom: Spacing.cardGap,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 6,
    minHeight: Spacing.touchTarget.min,
  },
  intervalDragHandle: {
    paddingRight: Spacing.xs,
    paddingLeft: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  intervalItemActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  intervalItemDragging: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  intervalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  intervalName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    flex: 1,
  },
  intervalDuration: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginRight: Spacing.xs,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  carouselScrollView: {
    overflow: "visible",
  },
  carouselContentContainer: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  cardPage: {
    height: "100%",
    paddingHorizontal: Spacing.md,
    paddingTop: 2,
    paddingBottom: 2,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  textInput: {
    minHeight: Spacing.touchTarget.min,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  roundsControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    minHeight: Spacing.touchTarget.min,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  roundAdjustButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.min,
    justifyContent: "center",
    alignItems: "center",
  },
  roundsValue: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    paddingHorizontal: Spacing.sm,
    textAlign: "center",
  },
  timerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  deleteIconButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#E63946",
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  saveIconButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  startIconButton: {
    flex: 1.5,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  duplicateIconButton: {
    flex: 1,
    minHeight: Spacing.touchTarget.min,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  editorInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  editorTextInput: {
    minHeight: Spacing.touchTarget.min,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  timeInput: {
    minHeight: Spacing.touchTarget.min,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    textAlign: "center",
    letterSpacing: 1,
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  colorPalette: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  intervalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  noIntervalText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.lineHeight.sm,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  bottomNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    minHeight: 28,
  },
  navSideContainer: {
    flex: 1,
    justifyContent: "center",
  },
  navButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    gap: Spacing.xs,
    alignSelf: "flex-start",
  },
  navButtonRight: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    gap: Spacing.xs,
    alignSelf: "flex-end",
  },
  navButtonText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.lineHeight.xs,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#6B7280",
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
});
