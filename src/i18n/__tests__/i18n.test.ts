import fs from "fs";
import path from "path";
import { t, i18n } from "../index";
import { EXERCISE_CATALOG } from "../../constants/exerciseCatalog";
import { BADGE_CATALOG } from "../../constants/badges";

describe("i18n Localization Test Suite", () => {
  const en = require("../en.json");
  const es = require("../es.json");
  const fr = require("../fr.json");

  function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === "object" && !Array.isArray(obj[k]) && obj[k] !== null) {
        keys = keys.concat(flattenKeys(obj[k], full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  }

  function getNested(obj: any, keyPath: string): any {
    const parts = keyPath.split(".");
    let curr = obj;
    for (const p of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[p];
    }
    return curr;
  }

  it("translates basic key with t() helper", () => {
    expect(t("common.appName")).toBe("Interval");
    expect(t("common.save")).toBe("Save");
  });

  it("handles fallback translations when key is missing", () => {
    expect(t("non_existent_key", { defaultValue: "Fallback" })).toBe("Fallback");
  });

  it("ensures 100% key parity across EN, ES, and FR dictionaries", () => {
    const enKeys = new Set(flattenKeys(en));
    const esKeys = new Set(flattenKeys(es));
    const frKeys = new Set(flattenKeys(fr));

    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
    const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));
    const missingInEnFromEs = [...esKeys].filter((k) => !enKeys.has(k));
    const missingInEnFromFr = [...frKeys].filter((k) => !enKeys.has(k));

    expect(missingInEs).toEqual([]);
    expect(missingInFr).toEqual([]);
    expect(missingInEnFromEs).toEqual([]);
    expect(missingInEnFromFr).toEqual([]);
  });

  it("ensures every exercise in EXERCISE_CATALOG is translated across all 3 languages", () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(getNested(en, `exercises.${exercise.id}.name`)).toBeTruthy();
      expect(getNested(en, `exercises.${exercise.id}.instructions`)).toBeTruthy();

      expect(getNested(es, `exercises.${exercise.id}.name`)).toBeTruthy();
      expect(getNested(es, `exercises.${exercise.id}.instructions`)).toBeTruthy();

      expect(getNested(fr, `exercises.${exercise.id}.name`)).toBeTruthy();
      expect(getNested(fr, `exercises.${exercise.id}.instructions`)).toBeTruthy();
    }
  });

  it("ensures every badge in BADGE_CATALOG is translated across all 3 languages", () => {
    for (const badge of BADGE_CATALOG) {
      expect(getNested(en, `badges.${badge.id}.name`)).toBeTruthy();
      expect(getNested(en, `badges.${badge.id}.description`)).toBeTruthy();
      expect(getNested(en, `badges.${badge.id}.tagline`)).toBeTruthy();

      expect(getNested(es, `badges.${badge.id}.name`)).toBeTruthy();
      expect(getNested(es, `badges.${badge.id}.description`)).toBeTruthy();
      expect(getNested(es, `badges.${badge.id}.tagline`)).toBeTruthy();

      expect(getNested(fr, `badges.${badge.id}.name`)).toBeTruthy();
      expect(getNested(fr, `badges.${badge.id}.description`)).toBeTruthy();
      expect(getNested(fr, `badges.${badge.id}.tagline`)).toBeTruthy();
    }
  });

  it("scans all codebase t() calls and guarantees zero missing keys", () => {
    const srcDir = path.resolve(__dirname, "../../");
    function getAllFiles(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!fullPath.includes("node_modules") && !fullPath.includes("__tests__")) {
            getAllFiles(fullPath, fileList);
          }
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const allCodeFiles = getAllFiles(srcDir);
    const tRegex = /\bt\(\s*["']([a-zA-Z0-9_.]+)["']/g;
    const missingKeys: { file: string; key: string }[] = [];

    for (const file of allCodeFiles) {
      const content = fs.readFileSync(file, "utf8");
      let match;
      while ((match = tRegex.exec(content)) !== null) {
        const key = match[1];
        if (key === "window") continue; // Dimensions.get("window") artifact
        if (getNested(en, key) === undefined) {
          missingKeys.push({ file: path.basename(file), key });
        }
      }
    }

    expect(missingKeys).toEqual([]);
  });

  it("handles getLocale, setLocale, and dynamic string interpolations", () => {
    const { getLocale, setLocale, t: translate } = require("../index");
    expect(getLocale()).toBeTruthy();

    setLocale("es");
    expect(getLocale()).toBe("es");
    expect(translate("selectTimer.greeting")).toBe("¡A Entrenar! ⚡️");

    setLocale("fr");
    expect(getLocale()).toBe("fr");
    expect(translate("selectTimer.greeting")).toBe("C'est l'heure du sport ! ⚡️");

    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(translate("selectTimer.greeting")).toBe("Let's Workout! ⚡️");

    // Dynamic parameter interpolation
    const interpolated = translate("timer.roundOf", { current: 2, total: 5 });
    expect(interpolated).toBe("Round 2 of 5");
  });
});
