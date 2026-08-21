/**
 * Fails (non-zero exit) if any IBAN-shaped string, Stripe secret key
 * (`sk_live_…`/`sk_test_…`), or Stripe webhook secret (`whsec_…`) is found
 * anywhere in the application's own files. Run via `npm run
 * security:check-secrets`; part of `npm run check` and should also gate
 * any production build/CI pipeline. General safety net — no feature in
 * this app currently uses these credential types, but it stays in place
 * in case one is added later.
 *
 * Scope is deliberately limited to "fichiers applicatifs" (app/, src/,
 * and top-level config files) — not scripts/ or tests/, where secret-like
 * *patterns* legitimately appear as test fixtures or as this very file's
 * own regexes, and not docs/, which discusses these concepts in prose
 * without containing real values.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { scanTextForSecrets, type SecretFinding } from "../src/utils/secretPatterns";

const SCAN_DIRS = ["app", "src"];
const SCAN_FILES = ["app.config.ts", "eas.json", "package.json", ".env", ".env.local"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".env"]);

function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  return TEXT_EXTENSIONS.has(ext) || path.basename(filePath).startsWith(".env");
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (stats.isFile() && isTextFile(full)) {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  const root = path.resolve(__dirname, "..");
  const files: string[] = [];

  for (const dir of SCAN_DIRS) {
    walk(path.join(root, dir), files);
  }
  for (const file of SCAN_FILES) {
    const full = path.join(root, file);
    try {
      statSync(full);
      files.push(full);
    } catch {
      // File doesn't exist (e.g. no local .env) — nothing to scan.
    }
  }

  const allFindings: { file: string; finding: SecretFinding }[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const finding of scanTextForSecrets(content)) {
      allFindings.push({ file: path.relative(root, file), finding });
    }
  }

  console.log(`\nIQRAnow secret scan — checked ${files.length} application file(s).`);

  if (allFindings.length > 0) {
    console.log(`\n${allFindings.length} problem(s) found:\n`);
    for (const { file, finding } of allFindings) {
      console.log(`  ✗ ${finding.kind} found in ${file}: "${redact(finding.match)}"`);
    }
    console.log(
      "\nNever commit banking details, IBANs, or API secret keys to this repository.\n",
    );
    process.exit(1);
  }

  console.log("No IBANs or Stripe secrets found.\n");
}

function redact(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

main();
