/**
 * organize-images.js
 *
 * Sorts product images from UUID dump folders into brand-labeled subfolders,
 * based on the brand prefix embedded in each filename (e.g. "0RB2140__...",
 * "0OO9250A__...", "0SK6002F__...", "0FZ5008__...", "0MK4180U__...").
 *
 * Usage:
 *   node scripts/organize-images.js
 *
 * Expects:
 *   - Raw images sitting in UUID folders under: data/images/<uuid>/
 *   - Will create/populate: data/images/rayban/, oakley/, swarovski/, ferrari/, michael_kors/, other/
 *   - Empties and removes the UUID source folders when done
 *
 * Moves files (not copy) so data/images ends up as brand folders only.
 */

const fs = require("fs");
const path = require("path");

const DEST_ROOT = path.join(__dirname, "..", "data", "images");

// Longer/more specific prefixes must be checked before shorter ones (e.g. "RBR" before "RB")
const BRAND_MAP = [
  { prefix: "RBR", folder: "rayban" },
  { prefix: "RB", folder: "rayban" },
  { prefix: "RX", folder: "rayban" },
  { prefix: "OO", folder: "oakley" },
  { prefix: "OX", folder: "oakley" },
  { prefix: "SK", folder: "swarovski" },
  { prefix: "FZ", folder: "ferrari" },
  { prefix: "MK", folder: "michael_kors" },
];

const BRAND_FOLDERS = new Set([
  ...BRAND_MAP.map((b) => b.folder),
  "other",
  "unsorted",
  "_unsorted",
]);

const IMAGE_RE = /\.(jpg|jpeg|png|webp)$/i;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function detectBrandFolder(filename) {
  // filenames look like "0RB2140__1087_32__P21__shad__fr.jpg" -- strip leading "0"
  const match = filename.match(/^0([A-Z]+)/);
  if (!match) return "other";
  const fullPrefix = match[1];
  for (const { prefix, folder } of BRAND_MAP) {
    if (fullPrefix.startsWith(prefix)) return folder;
  }
  return "other";
}

function main() {
  if (!fs.existsSync(DEST_ROOT)) {
    console.error(`Images folder not found: ${DEST_ROOT}`);
    process.exit(1);
  }

  const allFolders = [...new Set(BRAND_MAP.map((b) => b.folder)), "other"];
  for (const folder of allFolders) {
    fs.mkdirSync(path.join(DEST_ROOT, folder), { recursive: true });
  }

  const sourceDirs = fs
    .readdirSync(DEST_ROOT, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        !BRAND_FOLDERS.has(d.name) &&
        UUID_RE.test(d.name),
    )
    .map((d) => path.join(DEST_ROOT, d.name));

  if (sourceDirs.length === 0) {
    console.error(`No UUID source folders found under: ${DEST_ROOT}`);
    process.exit(1);
  }

  const counts = {};
  let processed = 0;
  let skipped = 0;

  for (const sourceDir of sourceDirs) {
    const files = fs
      .readdirSync(sourceDir)
      .filter((f) => IMAGE_RE.test(f));

    for (const file of files) {
      const folder = detectBrandFolder(file);
      const src = path.join(sourceDir, file);
      const dest = path.join(DEST_ROOT, folder, file);

      if (fs.existsSync(dest)) {
        skipped += 1;
        fs.unlinkSync(src);
        continue;
      }

      fs.renameSync(src, dest);
      counts[folder] = (counts[folder] || 0) + 1;
      processed += 1;
    }

    // Remove leftover non-image junk (.DS_Store etc.) then the empty UUID folder
    for (const leftover of fs.readdirSync(sourceDir)) {
      fs.unlinkSync(path.join(sourceDir, leftover));
    }
    fs.rmdirSync(sourceDir);
  }

  console.log(
    `\nMoved ${processed} image files from ${sourceDirs.length} folders.`,
  );
  if (skipped > 0) {
    console.log(`Skipped ${skipped} duplicates (already in brand folders).\n`);
  } else {
    console.log();
  }
  for (const [folder, count] of Object.entries(counts).sort()) {
    console.log(`  ${folder}: ${count} files`);
  }
  console.log(`\nDone. Brand folders under: ${DEST_ROOT}`);
}

main();
