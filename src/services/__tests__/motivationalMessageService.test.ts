import { getMotivationalCompletionMessage } from "../motivationalMessageService";
import { setLocale } from "../../i18n";

describe("motivationalMessageService", () => {
  beforeEach(() => {
    setLocale("en");
  });

  it("returns day of week specific motivation for Monday", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 1, // Monday
      durationSeconds: 600,
      rounds: 3,
      seed: 0,
    });
    expect(msg).toContain("Monday crushed with 3 strong rounds");
  });

  it("returns day of week variant 2 for Tuesday", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 2, // Tuesday
      durationSeconds: 600,
      rounds: 3,
      seed: 1,
    });
    expect(msg).toContain("Tuesday triumph");
  });

  it("returns endurance message for long workouts", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 1,
      durationSeconds: 1200, // 20 mins
      rounds: 4,
      seed: 6, // seed % 3 === 0 and seed % 2 === 0 triggers endurance v1
    });
    expect(msg).toContain("pure grit");
  });

  it("returns high rounds message for high round counts", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 3,
      durationSeconds: 600,
      rounds: 8,
      seed: 4, // seed % 3 === 1 and seed % 2 === 0 triggers highRounds v1
    });
    expect(msg).toContain("8 intense rounds conquered");
  });

  it("returns quick sprint message for short sessions", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 4,
      durationSeconds: 120, // 2 mins
      rounds: 2,
      seed: 2, // seed % 3 === 2 and seed % 2 === 0 triggers quickSprint v1
    });
    expect(msg).toContain("Fast, fierce, and done");
  });

  it("handles formatting for duration without minutes", () => {
    const msg = getMotivationalCompletionMessage({
      dayOfWeek: 5, // Friday
      durationSeconds: 45,
      rounds: 1,
      seed: 0,
    });
    expect(msg).toContain("Friday finish strong");
  });

  it("supports multilingual localized messages in Spanish and French", () => {
    setLocale("es");
    const esMsg = getMotivationalCompletionMessage({
      dayOfWeek: 1,
      durationSeconds: 600,
      rounds: 3,
      seed: 0,
    });
    expect(esMsg).toContain("¡Lunes conquistado con 3 rondas increíbles!");

    setLocale("fr");
    const frMsg = getMotivationalCompletionMessage({
      dayOfWeek: 1,
      durationSeconds: 600,
      rounds: 3,
      seed: 0,
    });
    expect(frMsg).toContain("Lundi conquis avec 3 superbes tours !");
  });
});
