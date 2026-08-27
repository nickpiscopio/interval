import { BADGE_CATALOG, getLocalizedBadge } from "../badges";

describe("badges Constants", () => {
  it("contains all unique badge definitions", () => {
    expect(BADGE_CATALOG.length).toBeGreaterThanOrEqual(14);
    const ids = new Set(BADGE_CATALOG.map((b) => b.id));
    expect(ids.size).toBe(BADGE_CATALOG.length);
  });

  it("retrieves localized badge with description and tagline", () => {
    const rawBadge = BADGE_CATALOG[0];
    const localized = getLocalizedBadge(rawBadge);
    expect(localized.id).toBe(rawBadge.id);
    expect(localized.name).toBeTruthy();
    expect(localized.description).toBeTruthy();
    expect(localized.tagline).toBeTruthy();

    const { getLocalizedBadges } = require("../badges");
    const allLocalized = getLocalizedBadges();
    expect(allLocalized.length).toBe(BADGE_CATALOG.length);
  });
});
