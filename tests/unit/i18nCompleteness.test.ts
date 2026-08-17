import fs from "node:fs";
import path from "node:path";

import { catalogs } from "@/i18n";
import { appConfig } from "@/config/appConfig";

type Json = Record<string, unknown>;

/** Recursively collects dot-path leaves. A "leaf" is a string, or an object containing an `other` key (our PluralForm shape). */
function collectLeaves(node: Json, prefix = ""): { plain: string[]; plural: string[] } {
  const plain: string[] = [];
  const plural: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      plain.push(fullKey);
    } else if (value && typeof value === "object" && "other" in (value as Json)) {
      plural.push(fullKey);
    } else if (value && typeof value === "object") {
      const nested = collectLeaves(value as Json, fullKey);
      plain.push(...nested.plain);
      plural.push(...nested.plural);
    }
  }
  return { plain, plural };
}

describe("i18n catalog completeness (all 10 languages)", () => {
  const english = collectLeaves(catalogs.en as unknown as Json);

  it("English source catalog is non-trivial", () => {
    expect(english.plain.length).toBeGreaterThan(50);
    expect(english.plural.length).toBeGreaterThan(0);
  });

  it.each(appConfig.supportedLocales)("locale '%s' has exactly the same keys as English (no missing, no extra)", (locale) => {
    const catalog = collectLeaves(catalogs[locale] as unknown as Json);
    const missingPlain = english.plain.filter((k) => !catalog.plain.includes(k));
    const extraPlain = catalog.plain.filter((k) => !english.plain.includes(k));
    const missingPlural = english.plural.filter((k) => !catalog.plural.includes(k));

    expect({ missingPlain, extraPlain, missingPlural }).toEqual({ missingPlain: [], extraPlain: [], missingPlural: [] });
  });

  it.each(appConfig.supportedLocales)("locale '%s' has no empty string values", (locale) => {
    const catalog = catalogs[locale] as unknown as Json;
    const empties: string[] = [];
    const walk = (node: Json, prefix: string): void => {
      for (const [key, value] of Object.entries(node)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string" && value.trim() === "") empties.push(fullKey);
        else if (value && typeof value === "object") walk(value as Json, fullKey);
      }
    };
    walk(catalog, "");
    expect(empties).toEqual([]);
  });

  it("Russian plural keys use the full one/few/many/other Slavic category set", () => {
    const ru = catalogs.ru;
    expect(ru.history.itemCount).toHaveProperty("one");
    expect(ru.history.itemCount).toHaveProperty("few");
    expect(ru.history.itemCount).toHaveProperty("many");
    expect(ru.history.itemCount).toHaveProperty("other");
  });

  it("Arabic plural keys use more than the minimal one/other category set", () => {
    const ar = catalogs.ar;
    const categories = Object.keys(ar.diagnostics.scheduledCount);
    expect(categories.length).toBeGreaterThan(2);
    expect(ar.diagnostics.scheduledCount).toHaveProperty("two");
  });

  it("Chinese (no grammatical plural) supplies only the 'other' category", () => {
    const zh = catalogs["zh-CN"];
    expect(Object.keys(zh.favorites.itemCount)).toEqual(["other"]);
  });

  it("Arabic strings actually contain Arabic-script characters", () => {
    expect(/\p{Script=Arabic}/u.test(catalogs.ar.home.title + catalogs.ar.common.tagline)).toBe(true);
  });

  it("Russian strings actually contain Cyrillic characters", () => {
    expect(/\p{Script=Cyrillic}/u.test(catalogs.ru.common.tagline)).toBe(true);
  });

  it("Hindi strings actually contain Devanagari characters", () => {
    expect(/\p{Script=Devanagari}/u.test(catalogs.hi.common.tagline)).toBe(true);
  });

  it("Bengali strings actually contain Bengali-script characters", () => {
    expect(/\p{Script=Bengali}/u.test(catalogs.bn.common.tagline)).toBe(true);
  });

  it("Simplified Chinese strings actually contain Han characters", () => {
    expect(/\p{Script=Han}/u.test(catalogs["zh-CN"].common.tagline)).toBe(true);
  });
});

/**
 * Static scan: every literal `t("a.b.c")` / `tPlural("a.b.c", ...)` call
 * found in app/ or src/ must resolve to a real English catalog key. This
 * catches typos and stale keys after a rename. It intentionally does NOT
 * fail on keys that exist but are never statically referenced (some, like
 * `themes.names.*`, are only ever read via a computed template — e.g.
 * `t(\`themes.names.${theme}\` as TranslationKey)` — which a static regex
 * scan cannot resolve). Those are reported, not failed, to keep the check
 * robust to legitimate dynamic usage.
 */
describe("i18n key usage matches defined keys", () => {
  const englishLeaves = new Set(collectLeaves(catalogs.en as unknown as Json).plain.concat(collectLeaves(catalogs.en as unknown as Json).plural));

  function walkSourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkSourceFiles(full, out);
      else if (/\.(tsx?|ts)$/.test(entry.name) && !full.includes(`${path.sep}i18n${path.sep}`)) out.push(full);
    }
    return out;
  }

  it("every statically-referenced translation key exists in the English catalog", () => {
    const root = path.resolve(__dirname, "..", "..");
    const files = [...walkSourceFiles(path.join(root, "app")), ...walkSourceFiles(path.join(root, "src"))];
    const callPattern = /\bt(?:Plural)?\(\s*["'`]([a-zA-Z0-9_.]+)["'`]/g;
    const unknownReferences: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      for (const match of content.matchAll(callPattern)) {
        const key = match[1];
        if (key && !englishLeaves.has(key)) {
          unknownReferences.push(`${path.relative(root, file)}: "${key}"`);
        }
      }
    }

    expect(unknownReferences).toEqual([]);
  });
});
