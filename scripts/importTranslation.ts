/**
 * Documented translation import tool.
 *
 * This does NOT fetch or invent translation text. It takes a JSON file you
 * already obtained from a real, licensed source (see docs/TRANSLATIONS.md
 * for how to choose one) and:
 *   1. validates every entry's id against the shipped Arabic corpus,
 *   2. validates every entry's text is non-empty and not truncated,
 *   3. computes a sha256 checksum of the input file,
 *   4. writes src/data/corpus/translations/<locale>.json,
 *   5. prints the exact manual steps left to wire it up (registering the
 *      source's metadata and adding one static import line) — these are
 *      left manual on purpose so a human reviews the license/attribution
 *      fields before they become part of the shipped app.
 *
 * Usage:
 *   npm run corpus:import -- \
 *     --locale fr \
 *     --file /path/to/your-licensed-translation.json \
 *     --translator "Full name or institution" \
 *     --title "Translation title" \
 *     --version "1.0" \
 *     --source-url "https://example.org/license-page" \
 *     --license "License name and terms summary" \
 *     --notice "Any required attribution notice text"
 *
 * Input file shape (see src/data/corpus/translations/schema.ts):
 *   { "entries": [ { "id": "94:5", "text": "..." }, ... ] }
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { appConfig } from "../src/config/appConfig";
import { getFullCorpus } from "../src/data/corpus";

interface Args {
  locale: string;
  file: string;
  translator: string;
  title: string;
  version: string;
  sourceUrl: string;
  license: string;
  notice: string;
  date?: string;
}

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token?.startsWith("--")) {
      const key = token.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith("--")) {
        map.set(key, value);
        i += 1;
      }
    }
  }
  const required = ["locale", "file", "translator", "title", "version", "source-url", "license", "notice"];
  const missing = required.filter((key) => !map.has(key));
  if (missing.length > 0) {
    console.error(`Missing required arguments: ${missing.map((m) => `--${m}`).join(", ")}`);
    process.exit(1);
  }
  return {
    locale: map.get("locale")!,
    file: map.get("file")!,
    translator: map.get("translator")!,
    title: map.get("title")!,
    version: map.get("version")!,
    sourceUrl: map.get("source-url")!,
    license: map.get("license")!,
    notice: map.get("notice")!,
    date: map.get("date"),
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (!(appConfig.supportedLocales as readonly string[]).includes(args.locale)) {
    console.error(`Unsupported locale "${args.locale}". Supported: ${appConfig.supportedLocales.join(", ")}`);
    process.exit(1);
  }

  if (!existsSync(args.file)) {
    console.error(`Input file not found: ${args.file}`);
    process.exit(1);
  }

  const raw = readFileSync(args.file, "utf8");
  const checksum = createHash("sha256").update(raw).digest("hex");

  let parsed: { entries: { id: string; text: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error(`Input file is not valid JSON: ${String(error)}`);
    process.exit(1);
  }

  if (!Array.isArray(parsed.entries)) {
    console.error('Input file must have shape { "entries": [{ "id": "94:5", "text": "..." }, ...] }');
    process.exit(1);
  }

  const knownIds = new Set(getFullCorpus().map((e) => e.arabic.id));
  const errors: string[] = [];
  for (const entry of parsed.entries) {
    if (!entry.id || !knownIds.has(entry.id)) {
      errors.push(`Entry id "${entry.id}" does not match any ayah in the shipped Arabic corpus.`);
    }
    if (!entry.text || !entry.text.trim()) {
      errors.push(`Entry "${entry.id}" has empty text.`);
    }
    if (entry.text?.trim().endsWith("...") || entry.text?.trim().endsWith("…")) {
      errors.push(`Entry "${entry.id}" looks artificially truncated (trailing ellipsis) — never truncate; omit the ayah instead.`);
    }
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} problem(s) found — nothing was written:\n`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const sourceId = `${args.locale}-${args.version}-${checksum.slice(0, 8)}`;
  const outDir = path.resolve(__dirname, "..", "src", "data", "corpus", "translations");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${args.locale}.json`);
  writeFileSync(
    outFile,
    JSON.stringify({ sourceId, entries: parsed.entries.map((e) => ({ id: e.id, text: e.text })) }, null, 2),
  );

  console.log(`\nWrote ${parsed.entries.length} entries to ${path.relative(process.cwd(), outFile)}`);
  console.log(`SHA-256 of source input file: ${checksum}\n`);
  console.log("Two manual steps remain (intentionally not automated — a human must confirm the license fields):\n");
  console.log("1. Add an entry to translationSources in src/data/corpus/sources.ts:\n");
  console.log(
    JSON.stringify(
      {
        id: sourceId,
        locale: args.locale,
        translatorName: args.translator,
        translationTitle: args.title,
        version: args.version,
        date: args.date,
        sourceUrl: args.sourceUrl,
        license: args.license,
        redistributionRightsConfirmed: false, // set to true only after you have personally verified this
        requiredNotice: args.notice,
        validationStatus: "unverified",
        checksumSha256: checksum,
      },
      null,
      2,
    ),
  );
  console.log(`\n2. Register the loader in src/data/corpus/index.ts (see the commented example there):\n`);
  console.log(`   import ${args.locale.replace("-", "_")}Translations from "./translations/${args.locale}.json";`);
  console.log(
    `   // add "${args.locale}": new Map(${args.locale.replace("-", "_")}Translations.entries.map(e => [e.id, { id: e.id, locale: "${args.locale}", text: e.text, sourceId: "${sourceId}" }])) to translationsByLocale\n`,
  );
  console.log("Then run `npm run corpus:validate` again before shipping.\n");
}

main();
