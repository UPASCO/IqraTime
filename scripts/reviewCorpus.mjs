/**
 * Interactive terminal tool implementing the "Reviewer checklist" in
 * docs/CORPUS.md: walks one qualified reviewer through every ayah or
 * hadith entry that is not yet status="publishable", shows the Arabic
 * text plus a translation side by side, and lets the reviewer promote,
 * reject, or skip it. Only "publishable" entries are ever selected by a
 * production build (getPublishableCorpus() / getRuntimeCorpus()) — this
 * script is the one intended way to move an entry into that state; there
 * is deliberately no bulk "mark everything publishable" shortcut.
 *
 * Saves catalog.json to disk after every single decision, so the review
 * is safely resumable across as many sessions as needed (Ctrl+C any time
 * — nothing already decided is lost, and already-publishable entries are
 * never shown again).
 *
 * A single reviewer who has just confirmed every checklist item for one
 * entry approves straight to "publishable" in one step, rather than
 * being walked through "editorially_validated" / "religiously_validated"
 * as separate prompts — those intermediate labels in EDITORIAL_STATUS_ORDER
 * exist to track a multi-stage workflow if one is ever used, not to force
 * extra keystrokes on a solo reviewer completing the whole checklist at once.
 *
 * Usage:
 *   node scripts/reviewCorpus.mjs --corpus=ayah [--locale=fr]
 *   node scripts/reviewCorpus.mjs --corpus=hadith [--locale=fr]
 *
 * Per entry:
 *   y        approve -> status becomes "publishable"
 *   n        reject -> status left as-is (stays excluded from production
 *            forever unless manually revisited later); asks for a short
 *            reason, appended to docs/<corpus>-review-log.json
 *   t        retag themes for this entry, then re-shows it
 *   e        add/edit the one-line editorialNote, then re-shows it
 *   s / Enter  skip for now, revisit in a future run
 *   q        save and quit
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const corpusType = args.corpus === "hadith" ? "hadith" : "ayah";
const locale = args.locale || "fr";

const DIR = corpusType === "hadith" ? path.join(ROOT, "src/data/corpus/hadith") : path.join(ROOT, "src/data/corpus");
const catalogPath = path.join(DIR, "catalog.json");
const arabicPath = path.join(DIR, "arabic.json");
const translationPath = path.join(DIR, "translations", `${locale}.json`);
const logPath = path.join(ROOT, "docs", `${corpusType}-review-log.json`);

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const arabic = JSON.parse(readFileSync(arabicPath, "utf8"));

let translation = { entries: [] };
try {
  translation = JSON.parse(readFileSync(translationPath, "utf8"));
} catch {
  console.log(`(no "${locale}" translation file found for this corpus — showing Arabic only)`);
}

let log = [];
try {
  log = JSON.parse(readFileSync(logPath, "utf8"));
} catch {
  // No log yet — starts empty.
}

const arabicById = new Map(arabic.entries.map((e) => [e.id, e]));
const translationById = new Map(translation.entries.map((e) => [e.id, e]));
const entryById = new Map(catalog.entries.map((e) => [e.id, e]));

function saveCatalog() {
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
}

function saveLog() {
  writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n", "utf8");
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function printEntry(entry, index, total) {
  const arabicEntry = arabicById.get(entry.id);
  const translationEntry = translationById.get(entry.id);
  console.log("\n" + "─".repeat(72));
  console.log(`[${index + 1}/${total}]  ${entry.id}   status: ${entry.status}   themes: ${entry.themes.join(", ") || "(none)"}`);
  if (corpusType === "hadith" && arabicEntry) {
    console.log(`${arabicEntry.collectionDisplayName} #${arabicEntry.hadithNumber}`);
  }
  if (entry.editorialNote) console.log(`note: ${entry.editorialNote}`);
  console.log("");
  console.log(arabicEntry?.text ?? "(arabic text missing)");
  console.log("");
  console.log(translationEntry?.text ?? `(no ${locale} translation found for this entry)`);
}

async function main() {
  const pending = catalog.entries.filter((e) => e.status !== "publishable");
  const alreadyDone = catalog.entries.length - pending.length;

  console.log(`\n${corpusType === "hadith" ? "Hadith" : "Ayah"} review — docs/CORPUS.md reviewer checklist`);
  console.log(`${alreadyDone} already publishable, ${pending.length} left to review.`);
  console.log("\ny=approve  n=reject  t=retag themes  e=edit note  s/Enter=skip  q=quit\n");

  let approved = 0;
  let rejected = 0;

  for (let i = 0; i < pending.length; i++) {
    const entry = entryById.get(pending[i].id);
    let redisplay = true;
    while (redisplay) {
      redisplay = false;
      printEntry(entry, i, pending.length);
      const answer = (await ask("\nDécision > ")).trim().toLowerCase();

      if (answer === "q") {
        console.log(`\nArrêt. ${approved} approuvée(s), ${rejected} rejetée(s) cette session. Relance la commande pour reprendre où tu t'es arrêté.`);
        rl.close();
        return;
      }
      if (answer === "y") {
        entry.status = "publishable";
        saveCatalog();
        approved++;
      } else if (answer === "n") {
        const reason = await ask("Raison du rejet (une ligne) > ");
        log.push({ id: entry.id, decision: "rejected", reason: reason.trim(), reviewedAtIso: new Date().toISOString() });
        saveLog();
        rejected++;
      } else if (answer === "t") {
        const themesInput = await ask(`Thèmes actuels: ${entry.themes.join(", ")}\nNouveaux thèmes (séparés par des virgules) > `);
        entry.themes = themesInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        saveCatalog();
        redisplay = true;
      } else if (answer === "e") {
        const note = await ask(`Note actuelle: ${entry.editorialNote ?? "(aucune)"}\nNouvelle note (une ligne, vide pour retirer) > `);
        entry.editorialNote = note.trim() || undefined;
        saveCatalog();
        redisplay = true;
      }
      // "s", blank, or anything else: skip, move to next entry.
    }
  }

  console.log(`\nTerminé. ${approved} approuvée(s), ${rejected} rejetée(s) cette session.`);
  rl.close();
}

main();
