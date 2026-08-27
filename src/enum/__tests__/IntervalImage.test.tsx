import { IntervalImage } from "../IntervalImage";
import { IntervalImageGradient } from "../IntervalImageGradient";

describe("IntervalImage and Gradients", () => {
  it("defines all interval image presets", () => {
    expect(IntervalImage.delete).toBeTruthy();
    expect(IntervalImage.save).toBeTruthy();
    expect(IntervalImage.play).toBeTruthy();
    expect(IntervalImage.pause).toBeTruthy();
    expect(IntervalImage.close).toBeTruthy();
  });

  it("defines interval image gradient stops and colors", () => {
    expect(IntervalImageGradient.start).toEqual({ x: 0, y: 0 });
    expect(IntervalImageGradient.end).toEqual({ x: 1, y: 1 });
    expect(IntervalImageGradient.colors.solid.asStrings.length).toBe(2);
    expect(IntervalImageGradient.colors.warning.asStrings.length).toBe(2);
    expect(IntervalImageGradient.colors.positive.asProps.length).toBe(2);
    expect(IntervalImageGradient.colors.transparent.asProps.length).toBe(2);
  });
});
