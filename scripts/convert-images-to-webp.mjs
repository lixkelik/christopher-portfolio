#!/usr/bin/env node
/**
 * Convert all PNG / JPG / JPEG under public/ to WebP (using the system
 * `cwebp` binary — no npm deps), and update every reference in src/ +
 * index.html accordingly.
 *
 * Requires: cwebp  (one-time:  brew install webp)
 *
 * Usage:
 *   node scripts/convert-images-to-webp.mjs              # convert + keep originals
 *   node scripts/convert-images-to-webp.mjs --delete     # also delete originals
 *   node scripts/convert-images-to-webp.mjs --dry        # show what would change
 *
 * Quality:
 *   - Small PNGs (≤ 50 KB, e.g. logos): lossless WebP
 *   - Large PNGs:                       quality 90
 *   - JPEG / JPG:                       quality 85
 *
 * Skips:
 *   - public/og-preview.png  +  public/my-notion-face-portrait.png
 *     (used by social-share scrapers / favicon, where WebP support is spotty)
 */

import { execFileSync } from "child_process";
import {
  existsSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { readdir } from "fs/promises";
import { extname, join, relative, resolve } from "path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const SRC_DIR = join(ROOT, "src");
const INDEX_HTML = join(ROOT, "index.html");

const SKIP_BASENAMES = new Set([
  "og-preview.png",
  "my-notion-face-portrait.png",
]);

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry");
const DELETE_ORIGINALS = args.has("--delete");

// ---------------------------------------------------------------------------
// Sanity check: cwebp must exist
// ---------------------------------------------------------------------------
try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" });
} catch {
  console.error(
    "ERROR: `cwebp` not found on PATH. Install it once with:  brew install webp"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Walk public/ for candidates
// ---------------------------------------------------------------------------

/** @returns {Promise<string[]>} absolute paths */
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const allFiles = await walk(PUBLIC_DIR);
const candidates = allFiles.filter((p) => {
  const ext = extname(p).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) return false;
  return !SKIP_BASENAMES.has(p.split("/").pop());
});

if (candidates.length === 0) {
  console.log("No PNG / JPG / JPEG files under public/. Nothing to do.");
  process.exit(0);
}

console.log(
  `Found ${candidates.length} image(s) to convert${DRY ? " (dry run)" : ""}.`
);

// ---------------------------------------------------------------------------
// 2. Run cwebp per file
// ---------------------------------------------------------------------------

/** Map of original-relative-path → webp-relative-path (relative to /public) */
const renamed = new Map();

for (const src of candidates) {
  const ext = extname(src).toLowerCase();
  const target = src.slice(0, -ext.length) + ".webp";
  const relSrc = relative(PUBLIC_DIR, src);
  const relTarget = relative(PUBLIC_DIR, target);
  renamed.set(relSrc, relTarget);

  if (DRY) {
    console.log(`  • ${relSrc} → ${relTarget}`);
    continue;
  }

  const sizeKb = statSync(src).size / 1024;
  const cwebpArgs =
    ext === ".png"
      ? sizeKb <= 50
        ? ["-lossless", "-quiet", src, "-o", target]
        : ["-q", "90", "-quiet", src, "-o", target]
      : ["-q", "85", "-quiet", src, "-o", target];

  try {
    execFileSync("cwebp", cwebpArgs, { stdio: "inherit" });
  } catch (err) {
    console.error(`  ✗ failed: ${relSrc} (${err.message})`);
    continue;
  }

  const newKb = statSync(target).size / 1024;
  const pct = ((1 - newKb / sizeKb) * 100).toFixed(0);
  console.log(
    `  ✓ ${relSrc.padEnd(60)}  ${sizeKb.toFixed(1).padStart(7)} KB → ${newKb
      .toFixed(1)
      .padStart(7)} KB  (-${pct}%)`
  );
}

// ---------------------------------------------------------------------------
// 3. Update references in source files + index.html
// ---------------------------------------------------------------------------

const sourceFiles = (await walk(SRC_DIR)).filter((p) =>
  /\.(json|ts|tsx|js|jsx|html|css)$/.test(p)
);
sourceFiles.push(INDEX_HTML);

let totalEdits = 0;
for (const file of sourceFiles) {
  if (!existsSync(file)) continue;
  const before = readFileSync(file, "utf8");
  let after = before;
  for (const [orig, webp] of renamed) {
    const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    after = after.replace(
      new RegExp(`(?<![A-Za-z0-9_./-])${escaped}`, "g"),
      webp
    );
  }
  if (after !== before) {
    let edits = 0;
    for (const [orig] of renamed) {
      if (before.includes(orig) && !after.includes(orig)) {
        edits += before.split(orig).length - 1;
      }
    }
    totalEdits += edits;
    if (DRY) {
      console.log(
        `  ✏  would update ${edits} ref(s) in ${relative(ROOT, file)}`
      );
    } else {
      writeFileSync(file, after);
      console.log(`  ✏  updated ${edits} ref(s) in ${relative(ROOT, file)}`);
    }
  }
}
console.log(`Total reference updates: ${totalEdits}`);

// ---------------------------------------------------------------------------
// 4. Optionally delete originals
// ---------------------------------------------------------------------------

if (DELETE_ORIGINALS && !DRY) {
  for (const src of candidates) {
    unlinkSync(src);
    console.log(`  🗑  removed ${relative(ROOT, src)}`);
  }
} else if (!DRY) {
  console.log(
    "\nOriginals kept. Re-run with --delete once you've verified the build."
  );
}
