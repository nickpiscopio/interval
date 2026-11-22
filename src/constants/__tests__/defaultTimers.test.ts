import { DEFAULT_AI_TIMERS } from "../defaultTimers";
import { INTERVAL_COLOR_PALETTE } from "../../model/Interval";

describe("defaultTimers Constants", () => {
  it("contains 5 default daily workout routines using only approved interval colors", () => {
    expect(DEFAULT_AI_TIMERS.length).toBe(5);
    for (const timer of DEFAULT_AI_TIMERS) {
      expect(timer.id).toBeTruthy();
      expect(timer.name).toBeTruthy();
      expect(timer.isAiGenerated).toBe(true);
      expect(timer.rounds).toBeGreaterThanOrEqual(1);
      expect(timer.intervals.length).toBeGreaterThan(0);
      for (const interval of timer.intervals) {
        expect(interval.id).toBeTruthy();
        expect(interval.name).toBeTruthy();
        expect(interval.duration).toBeGreaterThan(0);
        expect(INTERVAL_COLOR_PALETTE).toContain(interval.color);
      }
    }
  });
});
