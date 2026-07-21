#!/usr/bin/env node
/**
 * download-assets.mjs
 *
 * Reads scripts/assets.manifest.json and downloads each external image
 * into public/assets/<out>.
 *
 * Manifest entry shape:
 *   { "url": "https://...", "out": "brand/logo.png" }
 *
 * No credentials required — these are plain GETs to public URLs.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MANIFEST = path.join(ROOT, "scripts", "assets.manifest.json");
const OUT_DIR = path.join(ROOT, "public", "assets");

async function main() {
  const raw = await fs.readFile(MANIFEST, "utf8");
  const { assets } = JSON.parse(raw);
  if (!Array.isArray(assets) || assets.length === 0) {
    console.log("[sync-assets] manifest is empty — nothing to do.");
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of assets) {
    const { url, out } = entry;
    if (!url || !out) {
      console.warn("[sync-assets] skipping malformed entry:", entry);
      continue;
    }

    const dest = path.join(OUT_DIR, out);

    if (existsSync(dest) && !process.env.FORCE) {
      skipped += 1;
      continue;
    }

    await fs.mkdir(path.dirname(dest), { recursive: true });

    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        console.error(`[sync-assets] FAIL ${out} ← ${url} → HTTP ${res.status}`);
        failed += 1;
        continue;
      }
      await pipeline(res.body, createWriteStream(dest));
      console.log(`[sync-assets] ✓ ${out}`);
      downloaded += 1;
    } catch (err) {
      console.error(`[sync-assets] ERROR ${out} ← ${url}:`, err.message);
      failed += 1;
    }
  }

  console.log(
    `\n[sync-assets] done. downloaded=${downloaded} skipped=${skipped} failed=${failed}`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[sync-assets] fatal:", err);
  process.exit(1);
});
