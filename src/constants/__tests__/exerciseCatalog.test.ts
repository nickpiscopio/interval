import {
  EXERCISE_CATALOG,
  getLocalizedExercise,
  getLocalizedCategoryName,
} from "../exerciseCatalog";

describe("exerciseCatalog Constants", () => {
  it("contains 70 unique bodyweight exercises", () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(70);
    const ids = new Set(EXERCISE_CATALOG.map((e) => e.id));
    expect(ids.size).toBe(EXERCISE_CATALOG.length);
  });

  it("ensures all exercises have valid required properties", () => {
    for (const ex of EXERCISE_CATALOG) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(["cardio", "upper", "lower", "abs", "total"]).toContain(ex.category);
      expect(["beginner", "intermediate", "advanced"]).toContain(ex.difficulty);
      expect(Array.isArray(ex.instructions)).toBe(true);
      expect(ex.instructions.length).toBeGreaterThan(0);
    }
  });

  it("retrieves localized exercise by object", () => {
    const rawPushup = EXERCISE_CATALOG.find((e) => e.id === "pushups")!;
    const localizedPushup = getLocalizedExercise(rawPushup);
    expect(localizedPushup.id).toBe("pushups");
    expect(localizedPushup.name).toBeTruthy();
    expect(localizedPushup.instructions.length).toBeGreaterThan(0);
  });

  it("retrieves full localized catalog", () => {
    const { getLocalizedExerciseCatalog } = require("../exerciseCatalog");
    const full = getLocalizedExerciseCatalog();
    expect(full.length).toBe(EXERCISE_CATALOG.length);
  });

  it("retrieves localized category names", () => {
    expect(getLocalizedCategoryName("cardio")).toBeTruthy();
    expect(getLocalizedCategoryName("upper")).toBeTruthy();
    expect(getLocalizedCategoryName("lower")).toBeTruthy();
    expect(getLocalizedCategoryName("abs")).toBeTruthy();
    expect(getLocalizedCategoryName("total")).toBeTruthy();
    expect(getLocalizedCategoryName("unknown_cat" as any)).toBe("unknown_cat");
  });
});
