import Colors from "../Colors";
import Spacing from "../Spacing";
import FontSize from "../FontSize";
import Layout from "../Layout";

describe("Style Constants", () => {
  it("exports valid theme colors", () => {
    expect(Colors.light.text).toBeTruthy();
    expect(Colors.dark.text).toBeTruthy();
    expect(Colors.primary).toBeTruthy();
  });

  it("exports valid spacing tokens", () => {
    expect(Spacing.xs).toBeGreaterThan(0);
    expect(Spacing.sm).toBeGreaterThan(0);
    expect(Spacing.md).toBeGreaterThan(0);
    expect(Spacing.lg).toBeGreaterThan(0);
    expect(Spacing.xl).toBeGreaterThan(0);
  });

  it("exports valid sounds", () => {
    const Sounds = require("../Sounds").default;
    expect(Sounds.beep1).toContain("beep_1.mp3");
    expect(Sounds.beep2).toContain("beep_2.mp3");
  });

  it("exports valid font sizes and line heights", () => {
    expect(FontSize.xs).toBeGreaterThan(0);
    expect(FontSize.sm).toBeGreaterThan(0);
    expect(FontSize.md).toBeGreaterThan(0);
    expect(FontSize.lg).toBeGreaterThan(0);
    expect(FontSize.lineHeight.md).toBeGreaterThan(FontSize.md);
  });

  it("exports valid layout dimensions", () => {
    expect(Layout.window.width).toBeGreaterThan(0);
    expect(Layout.window.height).toBeGreaterThan(0);
    expect(Layout.isSmallDevice).toBeDefined();
  });
});
