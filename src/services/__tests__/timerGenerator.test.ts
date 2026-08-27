import { generateWorkout } from "../timerGenerator";

describe("timerGenerator", () => {
  it("generates a workout for weight_loss goal and total area", () => {
    const timer = generateWorkout({
      goal: "weight_loss",
      area: "total",
      experience: "beginner",
    });

    expect(timer.name).toContain("Fat Burn");
    expect(timer.rounds).toBe(3);
    expect(timer.intervals.length).toBeGreaterThan(0);
    expect(timer.isAiGenerated).toBe(true);

    const firstExercise = timer.intervals[0];
    expect(firstExercise.duration).toBe(30);
    const firstRest = timer.intervals[1];
    expect(firstRest.duration).toBe(15);
  });

  it("generates workout for toned goal and intermediate experience", () => {
    const timer = generateWorkout({
      goal: "toned",
      area: "abs",
      experience: "intermediate",
    });

    expect(timer.name).toContain("Tone & Sculpt");
    expect(timer.rounds).toBe(4);
    expect(timer.intervals[0].duration).toBe(40);
    expect(timer.intervals[1].duration).toBe(15);
  });

  it("generates workout for bulk goal and advanced experience", () => {
    const timer = generateWorkout({
      goal: "bulk",
      area: "upper",
      experience: "advanced",
    });

    expect(timer.name).toContain("Strength Boost");
    expect(timer.rounds).toBe(4);
    expect(timer.intervals[0].duration).toBe(45);
    expect(timer.intervals[1].duration).toBe(15);
  });

  it("generates workout with surprise_me area", () => {
    const timer = generateWorkout({
      goal: "weight_loss",
      area: "surprise_me",
      experience: "beginner",
    });

    expect(timer.name).toBeTruthy();
    expect(timer.intervals.length).toBeGreaterThan(0);
  });

  it("generates workout for cardio and lower body areas", () => {
    const cardioTimer = generateWorkout({
      goal: "weight_loss",
      area: "cardio",
      experience: "intermediate",
    });
    expect(cardioTimer.name).toContain("HIIT Cardio");

    const lowerTimer = generateWorkout({
      goal: "toned",
      area: "lower",
      experience: "advanced",
    });
    expect(lowerTimer.name).toContain("Lower Body");
  });
});
