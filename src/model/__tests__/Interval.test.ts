import {
  INTERVAL_COLOR_PALETTE,
  generateIntervalId,
  normalizeInterval,
  normalizeIntervalColor,
} from "../Interval";

describe("Interval Model", () => {
  it("exports the 7-color approved interval palette", () => {
    expect(INTERVAL_COLOR_PALETTE).toEqual([
      "#1ACC6C",
      "#10B981",
      "#3B82F6",
      "#8338EC",
      "#E63946",
      "#F95738",
      "#F9C74F",
    ]);
  });

  it("normalizes approved palette colors case-insensitively", () => {
    for (const color of INTERVAL_COLOR_PALETTE) {
      expect(normalizeIntervalColor(color)).toBe(color);
      expect(normalizeIntervalColor(color.toLowerCase())).toBe(color);
    }
  });

  it("remaps legacy off-palette hex colors and falls back to default green", () => {
    expect(normalizeIntervalColor("#4B5563")).toBe("#3B82F6");
    expect(normalizeIntervalColor("#4b5563")).toBe("#3B82F6");
    expect(normalizeIntervalColor("#6B7280")).toBe("#3B82F6");
    expect(normalizeIntervalColor("#6b7280")).toBe("#3B82F6");
    expect(normalizeIntervalColor("#F59E0B")).toBe("#F9C74F");
    expect(normalizeIntervalColor("#f59e0b")).toBe("#F9C74F");
    expect(normalizeIntervalColor("#059669")).toBe("#10B981");
    expect(normalizeIntervalColor("#059669".toLowerCase())).toBe("#10B981");
    expect(normalizeIntervalColor("#FFFFFF")).toBe("#1ACC6C");
    expect(normalizeIntervalColor("#123456")).toBe("#1ACC6C");
    expect(normalizeIntervalColor("")).toBe("#1ACC6C");
    expect(normalizeIntervalColor(undefined)).toBe("#1ACC6C");
  });

  it("generates unique interval IDs", () => {
    const id1 = generateIntervalId();
    const id2 = generateIntervalId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it("normalizes interval with existing id and remaps legacy color", () => {
    const raw = {
      id: "custom-id",
      name: "Squats",
      duration: 45,
      color: "#F59E0B",
      exerciseId: "squats",
    };
    const normalized = normalizeInterval(raw);
    expect(normalized.id).toBe("custom-id");
    expect(normalized.name).toBe("Squats");
    expect(normalized.duration).toBe(45);
    expect(normalized.color).toBe("#F9C74F");
    expect(normalized.exerciseId).toBe("squats");
  });

  it("normalizes interval without id by generating fallback id", () => {
    const raw = {
      name: "Lunges",
      duration: 30,
      color: "#3B82F6",
    };
    const normalized = normalizeInterval(raw, 2);
    expect(normalized.id).toContain("int_");
    expect(normalized.name).toBe("Lunges");
    expect(normalized.color).toBe("#3B82F6");
  });

  it("preserves sound when present and normalizes unknown colors to default", () => {
    const base = { name: "A", duration: 5, color: "#fff" };
    expect(normalizeInterval({ ...base, sound: "beep_3" }).sound).toBe("beep_3");
    const normalized = normalizeInterval(base);
    expect(normalized.sound).toBeUndefined();
    expect(normalized.color).toBe("#1ACC6C");
  });
});
