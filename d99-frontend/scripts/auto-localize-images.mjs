#!/usr/bin/env node
/**
 * auto-localize-images.mjs
 *
 * Scans one or more files (passed as CLI args) for external image URLs.
 * For every match it:
 *   1. Picks a stable local path under public/assets/<folder>/<basename>.
 *   2. Downloads the file if it isn't already on disk.
 *   3. Rewrites the URL in the source file to `/assets/<folder>/<basename>`.
 *   4. Adds a `{ "url": ..., "out": ... }` entry to scripts/assets.manifest.json
 *      so future `npm run sync-assets` runs keep it fresh.
 *
 * Designed to be invoked from a Claude Code PostToolUse hook after every
 * Edit/Write under frontend/. Safe to run repeatedly (idempotent): files
 * already on disk are skipped, manifest entries are de-duped.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "assets");
const MANIFEST = path.join(ROOT, "scripts", "assets.manifest.json");

// Only files inside src/ should be scanned. Lock files, node_modules,
// the manifest itself and anything in public/ are out of scope.
const SCAN_GLOB_PREFIX = path.join(ROOT, "src");

// Match http(s) URLs that end in an image extension. We deliberately
// exclude SVG `data:` URIs and the gstatic Roboto Condensed CDN (those
// are font CSS @imports, not images we want to localize).
const URL_RE =
  /(["'`(])(https?:\/\/[^"'`)\s]+\.(?:png|jpe?g|gif|webp|svg|avif|ico))(\1|\))/gi;

const SKIP_HOSTS = new Set([
  "fonts.gstatic.com",
  "fonts.googleapis.com",
]);

// Map remote URLs to a local folder under public/assets/. Edit this list
// when you want a host to land somewhere specific.
function classifyUrl(u) {
  const url = new URL(u);
  const lastSeg = url.pathname.split("/").filter(Boolean).pop() ?? "asset";
  const host = url.hostname;

  // Heuristics by URL path
  if (/social[-_]?icons?/i.test(url.pathname)) return { folder: "social", name: lastSeg };
  if (/logo/i.test(url.pathname)) return { folder: "brand", name: lastSeg };
  if (/banner/i.test(url.pathname)) return { folder: "banners", name: lastSeg };
  if (/icon/i.test(url.pathname)) return { folder: "icons", name: lastSeg };
  if (/casino/i.test(url.pathname)) return { folder: "casino", name: lastSeg };
  if (/sport/i.test(url.pathname)) return { folder: "sports", name: lastSeg };
  if (/flag/i.test(url.pathname)) return { folder: "flags", name: lastSeg };

  // Fallback: bucket by hostname so different CDNs don't collide.
  return { folder: `cdn/${host}`, name: lastSeg };
}

async function loadManifest() {
  try {
    const raw = await fs.readFile(MANIFEST, "utf8");
    const json = JSON.parse(raw);
    if (!Array.isArray(json.assets)) json.assets = [];
    return json;
  } catch {
    return { assets: [] };
  }
}

async function saveManifest(m) {
  await fs.writeFile(MANIFEST, JSON.stringify(m, null, 2) + "\n");
}

async function downloadIfMissing(url, dest) {
  if (existsSync(dest)) return "skipped";
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(dest));
  return "downloaded";
}

async function processFile(absPath, manifest) {
  if (!absPath.startsWith(SCAN_GLOB_PREFIX)) return null;

  let src;
  try {
    src = await fs.readFile(absPath, "utf8");
  } catch {
    return null; // not a text file or unreadable
  }

  const matches = [...src.matchAll(URL_RE)];
  if (matches.length === 0) return null;

  let rewritten = src;
  let touched = 0;
  let downloadedCount = 0;
  const seen = new Set();

  for (const m of matches) {
    const url = m[2];
    if (seen.has(url)) continue;
    seen.add(url);

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (SKIP_HOSTS.has(parsed.hostname)) continue;

    const { folder, name } = classifyUrl(url);
    const out = path.posix.join(folder, name);
    const dest = path.join(OUT_DIR, out);
    const localPath = `/assets/${out}`;

    try {
      const result = await downloadIfMissing(url, dest);
      if (result === "downloaded") downloadedCount += 1;
    } catch (err) {
      console.error(`[auto-localize] FAIL ${url}: ${err.message}`);
      continue;
    }

    // Rewrite every occurrence of the URL in this file with the local path.
    const before = rewritten;
    rewritten = rewritten.split(url).join(localPath);
    if (rewritten !== before) touched += 1;

    // De-dup against the manifest.
    const exists = manifest.assets.some(
      (a) => a.url === url || a.out === out,
    );
    if (!exists) manifest.assets.push({ url, out });
  }

  if (touched > 0 && rewritten !== src) {
    await fs.writeFile(absPath, rewritten);
  }

  return touched > 0 || downloadedCount > 0
    ? { file: path.relative(ROOT, absPath), touched, downloaded: downloadedCount }
    : null;
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  if (args.length === 0) {
    // Quiet exit — hook may fire on tools that don't pass file paths.
    return;
  }

  const manifest = await loadManifest();
  const results = [];

  for (const arg of args) {
    const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
    try {
      const r = await processFile(abs, manifest);
      if (r) results.push(r);
    } catch (err) {
      console.error(`[auto-localize] error on ${arg}: ${err.message}`);
    }
  }

  if (results.length > 0) {
    await saveManifest(manifest);
    for (const r of results) {
      console.log(
        `[auto-localize] ${r.file} → rewrote ${r.touched} url(s), downloaded ${r.downloaded} file(s)`,
      );
    }
  }
}

main().catch((err) => {
  console.error("[auto-localize] fatal:", err);
  process.exit(0); // never block the hook
});
