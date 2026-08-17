// One-off asset generation helper (not part of the app bundle or CI).
// Rasterizes the SVG sources in assets/source/ into the PNGs referenced by
// app.config.ts. Re-run after editing an SVG: `node scripts/generateIconAssets.mjs`.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = (name) => path.join(root, "assets", "source", name);
const out = (name) => path.join(root, "assets", "images", name);

mkdirSync(path.join(root, "assets", "images"), { recursive: true });

const jobs = [
  { in: "icon.svg", out: "icon.png", size: 1024 },
  { in: "adaptive-icon-foreground.svg", out: "adaptive-icon.png", size: 1024 },
  { in: "notification-icon.svg", out: "notification-icon.png", size: 256 },
  { in: "splash-icon.svg", out: "splash-icon.png", size: 512 },
  { in: "icon.svg", out: "favicon.png", size: 196 },
];

for (const job of jobs) {
  await sharp(src(job.in), { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(out(job.out));
  console.log(`wrote ${job.out} (${job.size}x${job.size})`);
}
