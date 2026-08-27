import { generateIntervalId, normalizeInterval } from "../Interval";

describe("Interval Model", () => {
  it("generates unique interval IDs", () => {
    const id1 = generateIntervalId();
    const id2 = generateIntervalId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it("normalizes interval with existing id", () => {
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
    expect(normalized.color).toBe("#F59E0B");
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
  });
});
