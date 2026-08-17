/**
 * Corpus validator — run manually (`npm run corpus:validate`) and in CI.
 *
 * In development mode it reports issues but exits 0 unless something is
 * structurally broken (e.g. duplicate ids, dangling references).
 *
 * In production mode (`CORPUS_ENV=production npm run corpus:validate:prod`)
 * it additionally FAILS THE BUILD (non-zero exit) if:
 *   - any shipped entry is marked isDemoOnly
 *   - any shipped entry's editorial status is not "publishable"
 *   - any of the ten required languages has zero imported translations
 *   - any translation source is missing a license or redistribution confirmation
 *
 * This is deliberately strict: see docs/CORPUS.md for the exact checklist
 * a qualified reviewer must complete before an entry can become
 * "publishable", and docs/TRANSLATIONS.md for how to import a real,
 * licensed translation for a language.
 */
import { appConfig } from "../src/config/appConfig";
import { getFullCorpus, translationSources, hasAnyTranslations } from "../src/data/corpus";
import { ALL_THEME_KEYS, EDITORIAL_STATUS_ORDER } from "../src/domain/types";
import { catalogs } from "../src/i18n";

interface Finding {
  readonly level: "error" | "warning";
  readonly message: string;
}

function main(): void {
  const isProduction = process.env.CORPUS_ENV === "production";
  const findings: Finding[] = [];
  const entries = getFullCorpus();

  // --- Structural checks (always run) ---------------------------------
  const seenIds = new Set<string>();
  for (const entry of entries) {
    const id = entry.arabic.id;

    if (seenIds.has(id)) {
      findings.push({ level: "error", message: `Duplicate ayah id "${id}"` });
    }
    seenIds.add(id);

    if (entry.arabic.id !== entry.catalog.id) {
      findings.push({ level: "error", message: `Arabic/catalog id mismatch for "${id}"` });
    }
    if (entry.arabic.surah < 1 || entry.arabic.surah > 114) {
      findings.push({ level: "error", message: `Invalid surah number for "${id}"` });
    }
    if (entry.arabic.ayah < 1) {
      findings.push({ level: "error", message: `Invalid ayah number for "${id}"` });
    }
    if (!entry.arabic.text.trim()) {
      findings.push({ level: "error", message: `Empty Arabic text for "${id}"` });
    }
    if (entry.arabic.text.trim().endsWith("...") || entry.arabic.text.trim().endsWith("…")) {
      findings.push({ level: "error", message: `Arabic text for "${id}" looks artificially truncated (trailing ellipsis)` });
    }
    if (!EDITORIAL_STATUS_ORDER.includes(entry.catalog.status)) {
      findings.push({ level: "error", message: `Unknown editorial status "${entry.catalog.status}" for "${id}"` });
    }
    if (entry.catalog.themes.length === 0) {
      findings.push({ level: "warning", message: `Entry "${id}" has no themes assigned` });
    }
    for (const theme of entry.catalog.themes) {
      if (!ALL_THEME_KEYS.includes(theme)) {
        findings.push({ level: "error", message: `Entry "${id}" references unknown theme "${theme}"` });
      }
    }
    if (entry.catalog.status !== "publishable" && !entry.catalog.isDemoOnly) {
      findings.push({
        level: "warning",
        message: `Entry "${id}" is not publishable and not marked isDemoOnly — clarify its intent`,
      });
    }
  }

  // --- Translation source registry checks -----------------------------
  for (const source of translationSources) {
    if (!source.license.trim()) findings.push({ level: "error", message: `Translation source "${source.id}" is missing a license` });
    if (!source.translatorName.trim()) findings.push({ level: "error", message: `Translation source "${source.id}" is missing a translator name` });
    if (!source.sourceUrl.trim()) findings.push({ level: "error", message: `Translation source "${source.id}" is missing a source URL` });
    if (!source.redistributionRightsConfirmed) {
      findings.push({ level: "error", message: `Translation source "${source.id}" has not confirmed redistribution rights` });
    }
  }

  // --- Language coverage ------------------------------------------------
  for (const locale of appConfig.supportedLocales) {
    if (!(locale in catalogs)) {
      findings.push({ level: "error", message: `Missing UI translation catalog for locale "${locale}"` });
    }
    if (!hasAnyTranslations(locale)) {
      findings.push({
        level: isProduction ? "error" : "warning",
        message: `No Quran translation corpus imported for locale "${locale}" — see docs/TRANSLATIONS.md`,
      });
    }
  }

  // --- Production-only gating ------------------------------------------
  if (isProduction) {
    const demoEntries = entries.filter((e) => e.catalog.isDemoOnly);
    if (demoEntries.length > 0) {
      findings.push({
        level: "error",
        message: `${demoEntries.length} entries are marked isDemoOnly and must not ship in a production build`,
      });
    }
    const nonPublishable = entries.filter((e) => e.catalog.status !== "publishable");
    if (nonPublishable.length > 0) {
      findings.push({
        level: "error",
        message: `${nonPublishable.length} entries are not "publishable" and must not ship in a production build`,
      });
    }
    const publishable = entries.filter((e) => e.catalog.status === "publishable" && !e.catalog.isDemoOnly);
    if (publishable.length === 0) {
      findings.push({
        level: "error",
        message: "Zero publishable, non-demo ayat in the corpus — a production build must ship at least one.",
      });
    }
  }

  // --- Report -------------------------------------------------------
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");

  console.log(`\nAyahNow corpus validation (${isProduction ? "PRODUCTION" : "development"} mode)`);
  console.log(`Entries checked: ${entries.length}`);
  console.log(`Translation sources registered: ${translationSources.length}`);

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ⚠ ${w.message}`);
  }
  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.log(`  ✗ ${e.message}`);
    console.log("\nCorpus validation FAILED.\n");
    process.exit(1);
  }

  console.log("\nCorpus validation passed.\n");
}

main();
