import {
  EXERCISE_CATALOG,
  BODY_PART_CATALOG,
  getLocalizedExercise,
  getLocalizedExerciseCatalog,
  getLocalizedCategoryName,
  getLocalizedBodyPartName,
} from "../exerciseCatalog";

describe("exerciseCatalog", () => {
  it("contains all categories including corrective / physical therapy", () => {
    const categories = new Set(EXERCISE_CATALOG.map((ex) => ex.category));
    expect(categories.has("corrective")).toBe(true);
    expect(categories.has("cardio")).toBe(true);
    expect(categories.has("upper")).toBe(true);
    expect(categories.has("lower")).toBe(true);
    expect(categories.has("abs")).toBe(true);
  });

  it("contains valid friendly body part definitions in BODY_PART_CATALOG", () => {
    expect(BODY_PART_CATALOG.length).toBeGreaterThanOrEqual(10);
    const ids = BODY_PART_CATALOG.map((b) => b.id);
    expect(ids).toContain("ankle_feet");
    expect(ids).toContain("knees");
    expect(ids).toContain("pelvic_floor");
    expect(ids).toContain("lower_back");
    expect(ids).toContain("upper_back_shoulders");
    expect(ids).toContain("neck");
    expect(ids).toContain("wrists_hands");
    expect(ids).toContain("elbows_forearms");
    expect(ids).toContain("hips_glutes");
  });

  it("localizes body part names and category names", () => {
    expect(getLocalizedBodyPartName("ankle_feet")).toBe("Ankle & Feet");
    expect(getLocalizedBodyPartName("lower_back")).toBe("Lower Back");
    expect(getLocalizedCategoryName("corrective")).toBe("Physical Therapy");
    expect(getLocalizedCategoryName("cardio")).toBe("Cardio");
  });

  it("returns localized exercise with description and instructions", () => {
    const firstEx = EXERCISE_CATALOG[0];
    const localized = getLocalizedExercise(firstEx);
    expect(localized.name).toBeTruthy();
    expect(localized.description).toBeTruthy();
    expect(localized.instructions.length).toBeGreaterThan(0);
  });

  it("returns full localized catalog", () => {
    const catalog = getLocalizedExerciseCatalog();
    expect(catalog.length).toBe(EXERCISE_CATALOG.length);
  });
});
