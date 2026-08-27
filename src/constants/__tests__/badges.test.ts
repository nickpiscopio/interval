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
