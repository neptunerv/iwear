/**
 * build-image-update-csv.js
 *
 * Builds a Shopify product CSV with only Handle + Image Src (+ Image Position)
 * for products covered by data/<brand>_zip_coverage.json, using CDN URLs from
 * data/<brand>_image_urls.json. Same attachment method as the Jul 25 import.
 *
 * Usage:
 *   node scripts/build-image-update-csv.js oakley
 *   node scripts/build-image-update-csv.js oakley --out data/oakley_image_update.csv
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const brand = args.find((a) => !a.startsWith("--"));
const outArgIdx = args.indexOf("--out");
const outPath =
  outArgIdx >= 0
    ? path.resolve(args[outArgIdx + 1])
    : path.join(PROJECT_ROOT, "data", `${brand}_image_update.csv`);

if (!brand) {
  console.error("Usage: node scripts/build-image-update-csv.js <brand> [--out path]");
  process.exit(1);
}

const urlMapPath = path.join(PROJECT_ROOT, "data", `${brand}_image_urls.json`);
const coveragePath = path.join(PROJECT_ROOT, "data", `${brand}_zip_coverage.json`);

if (!fs.existsSync(urlMapPath) || !fs.existsSync(coveragePath)) {
  console.error("Missing url map or coverage JSON under data/");
  process.exit(1);
}

const urlMap = JSON.parse(fs.readFileSync(urlMapPath, "utf8"));
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));

function selectUrlsForKey(imageKey) {
  const named = {};
  const degree = {};
  for (const [filename, url] of Object.entries(urlMap)) {
    let m = filename.match(
      /^(0[A-Z0-9]+__[A-Z0-9_]+?)__(P21|STD)__(noshad|shad)__([a-z0-9]+)\.jpg$/i,
    );
    if (m && m[1].toUpperCase() === imageKey.toUpperCase()) {
      named[`${m[4].toLowerCase()}_${m[3].toLowerCase()}`] = url;
      continue;
    }
    m = filename.match(/^(0[A-Z0-9]+__[A-Z0-9_]+)_(\d{3})A\.jpg$/i);
    if (m && m[1].toUpperCase() === imageKey.toUpperCase()) {
      degree[m[2]] = url;
    }
  }
  const picks = [];
  if (named.fr_noshad) picks.push(named.fr_noshad);
  if (named.qt_noshad) picks.push(named.qt_noshad);
  if (picks.length === 0) {
    if (degree["000"]) picks.push(degree["000"]);
    if (degree["030"]) picks.push(degree["030"]);
  }
  if (picks.length === 0) {
    const any = Object.values(named)[0] || Object.values(degree)[0];
    if (any) picks.push(any);
  }
  return picks;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const rows = [["Handle", "Image Src", "Image Position", "Image Alt Text"]];
let withImages = 0;
let waiting = 0;

for (const item of coverage.satisfied) {
  const urls = selectUrlsForKey(item.img_key);
  if (urls.length === 0) {
    waiting++;
    continue;
  }
  withImages++;
  urls.forEach((url, idx) => {
    rows.push([
      item.handle,
      url,
      String(idx + 1),
      item.title || item.sku,
    ]);
  });
}

fs.writeFileSync(
  outPath,
  rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n",
);

console.log(`Wrote ${outPath}`);
console.log(`Products with images in CSV: ${withImages}`);
console.log(`Still waiting on CDN upload: ${waiting}`);
console.log(`CSV data rows: ${rows.length - 1}`);
