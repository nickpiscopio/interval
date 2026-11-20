import { BADGE_CATALOG, getLocalizedBadge, getLocalizedBadges } from "../badges";

describe("badges Constants", () => {
  it("contains all unique badge definitions and required categories", () => {
    expect(BADGE_CATALOG.length).toBeGreaterThanOrEqual(20);
    const ids = new Set(BADGE_CATALOG.map((b) => b.id));
    expect(ids.size).toBe(BADGE_CATALOG.length);

    const categories = new Set(BADGE_CATALOG.map((b) => b.category));
    expect(categories.has("discovery")).toBe(true);
    expect(categories.has("corrective")).toBe(true);
    expect(categories.has("streak")).toBe(true);
    expect(categories.has("sharing")).toBe(true);
    expect(categories.has("variety")).toBe(true);
  });

  it("contains timer variety badges with distinct metadata and 'different timers' descriptions", () => {
    const expectedVarietyBadges = [
      { id: "variety_5", name: "Routine Sampler", emoji: "🎲", count: "5" },
      { id: "variety_10", name: "Workout Chameleon", emoji: "🦎", count: "10" },
      { id: "variety_25", name: "Timer Connoisseur", emoji: "🎭", count: "25" },
      { id: "variety_50", name: "Master of Variety", emoji: "💎", count: "50" },
    ];

    const varietyBadges = BADGE_CATALOG.filter((b) => b.category === "variety");
    expect(varietyBadges).toHaveLength(expectedVarietyBadges.length);

    const iconNames = new Set(varietyBadges.map((b) => b.iconName));
    expect(iconNames.size).toBe(expectedVarietyBadges.length);

    for (const expected of expectedVarietyBadges) {
      const badge = BADGE_CATALOG.find((b) => b.id === expected.id);
      expect(badge).toBeDefined();
      expect(badge?.category).toBe("variety");
      expect(badge?.name).toBe(expected.name);
      expect(badge?.emoji).toBe(expected.emoji);
      expect(badge?.tagline).toBeTruthy();
      expect(badge?.description).toContain(`${expected.count} different timers`);
      expect(badge?.gradientColors).toHaveLength(2);
    }
  });

  it("contains discovery and corrective badges", () => {
    const ids = BADGE_CATALOG.map((b) => b.id);
    expect(ids).toContain("curious_explorer");
    expect(ids).toContain("anatomical_master");
    expect(ids).toContain("movement_scholar");
    expect(ids).toContain("rehab_rookie");
    expect(ids).toContain("bulletproof_joints");
    expect(ids).toContain("posture_perfectionist");
    expect(ids).toContain("iron_alignment");
    expect(ids).toContain("two_a_day_streak_2");
    expect(ids).toContain("two_a_day_streak_3");
    expect(ids).toContain("three_a_day_streak_2");
    expect(ids).toContain("three_a_day_streak_3");

    const twoStreak2 = BADGE_CATALOG.find((b) => b.id === "two_a_day_streak_2");
    const twoStreak3 = BADGE_CATALOG.find((b) => b.id === "two_a_day_streak_3");
    expect(twoStreak2?.description).toContain("2 workouts spaced at least 1 hour apart");
    expect(twoStreak2?.description).not.toContain("2+");
    expect(twoStreak3?.description).toContain("2 workouts spaced at least 1 hour apart");
    expect(twoStreak3?.description).not.toContain("2+");
  });

  it("retrieves localized badge with description and tagline", () => {
    const rawBadge = BADGE_CATALOG[0];
    const localized = getLocalizedBadge(rawBadge);
    expect(localized.id).toBe(rawBadge.id);
    expect(localized.name).toBeTruthy();
    expect(localized.description).toBeTruthy();
    expect(localized.tagline).toBeTruthy();

    const allLocalized = getLocalizedBadges();
    expect(allLocalized.length).toBe(BADGE_CATALOG.length);
  });
});
