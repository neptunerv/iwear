/**
 * upload-images-to-shopify.js
 *
 * Uploads selected product images from data/images/<brand>/ to Shopify via the
 * Admin GraphQL API, and writes { filename -> Shopify CDN URL } to JSON.
 *
 * Flow per image (Shopify's official staged upload process):
 *   1. stagedUploadsCreate  -> temporary upload target
 *   2. POST the raw file    -> upload bytes to that target
 *   3. fileCreate            -> register as a Shopify file
 *   4. poll until fileStatus = READY, then read the CDN URL
 *
 * Requires in .env.local (project root):
 *   SHOPIFY_STORE_URL=your-store.myshopify.com
 *   SHOPIFY_ACCESS_TOKEN=shpat_...
 *
 * Usage:
 *   node scripts/upload-images-to-shopify.js rayban --dry-run
 *   node scripts/upload-images-to-shopify.js swarovski --limit 3
 *   node scripts/upload-images-to-shopify.js rayban
 *   node scripts/upload-images-to-shopify.js --all
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

function loadEnvFile(filename) {
  const filepath = path.join(PROJECT_ROOT, filename);
  if (!fs.existsSync(filepath)) return;

  for (const line of fs.readFileSync(filepath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const STORE = process.env.SHOPIFY_STORE_URL;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2026-04";

const BRAND_FOLDERS = [
  "rayban",
  "oakley",
  "swarovski",
  "ferrari",
  "michael_kors",
  "other",
];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const dryRun = flags.has("--dry-run");
const uploadAll = flags.has("--all");
const limitArg = args.find((a) => a.startsWith("--limit"));
const limit = limitArg ? Number(limitArg.split("=")[1] ?? args[args.indexOf(limitArg) + 1]) : null;

if (!STORE || !TOKEN) {
  console.error(
    "Missing SHOPIFY_STORE_URL or SHOPIFY_ACCESS_TOKEN in .env.local",
  );
  process.exit(1);
}

const GRAPHQL_URL = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

async function shopifyGraphQL(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

async function createStagedUpload(filename, mimeType) {
  const query = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`;
  const variables = {
    input: [{ filename, mimeType, httpMethod: "POST", resource: "IMAGE" }],
  };
  const data = await shopifyGraphQL(query, variables);
  const errs = data.stagedUploadsCreate.userErrors;
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.stagedUploadsCreate.stagedTargets[0];
}

async function uploadFileToTarget(target, filepath) {
  const form = new FormData();
  for (const p of target.parameters) {
    form.append(p.name, p.value);
  }
  const fileBuffer = fs.readFileSync(filepath);
  form.append("file", new Blob([fileBuffer]), path.basename(filepath));

  const res = await fetch(target.url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }
}

async function finalizeFile(resourceUrl, filename) {
  const query = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id fileStatus ... on MediaImage { image { url } } }
        userErrors { field message }
      }
    }`;
  const variables = {
    files: [{ contentType: "IMAGE", originalSource: resourceUrl, filename }],
  };
  const data = await shopifyGraphQL(query, variables);
  const errs = data.fileCreate.userErrors;
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.fileCreate.files[0];
}

async function pollUntilReady(fileId, maxAttempts = 20) {
  const query = `
    query getFile($id: ID!) {
      node(id: $id) {
        ... on MediaImage { id fileStatus image { url } }
      }
    }`;

  for (let i = 0; i < maxAttempts; i++) {
    const data = await shopifyGraphQL(query, { id: fileId });
    const node = data.node;
    if (!node) throw new Error(`File not found: ${fileId}`);
    if (node.fileStatus === "READY" && node.image?.url) return node.image.url;
    if (node.fileStatus === "FAILED") {
      throw new Error(`File processing failed for ${fileId}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(`Timed out waiting for file ${fileId} to become READY`);
}

async function uploadOneImage(filepath) {
  const filename = path.basename(filepath);
  const ext = path.extname(filename).toLowerCase();
  const mimeType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const target = await createStagedUpload(filename, mimeType);
  await uploadFileToTarget(target, filepath);
  const file = await finalizeFile(target.resourceUrl, filename);
  return pollUntilReady(file.id);
}

function groupAndSelectImages(files) {
  const namedPattern =
    /^(0[A-Z0-9]+__[A-Z0-9_]+?)__(P21|STD)__(noshad|shad)__([a-z0-9]+)\.jpg$/i;
  const degreePattern =
    /^(0[A-Z0-9]+__[A-Z0-9_]+)_(\d{3})A\.jpg$/i;

  const groups = {};
  const unmatched = [];

  for (const f of files) {
    let m = f.match(namedPattern);
    if (m) {
      const [, key, , shad, angle] = m;
      groups[key] = groups[key] || { namedAngles: {}, degreeAngles: {} };
      groups[key].namedAngles[`${angle}_${shad}`] = f;
      continue;
    }

    m = f.match(degreePattern);
    if (m) {
      const [, key, deg] = m;
      groups[key] = groups[key] || { namedAngles: {}, degreeAngles: {} };
      groups[key].degreeAngles[deg] = f;
      continue;
    }

    unmatched.push(f);
  }

  const selected = [];
  let skippedCount = 0;
  let totalAvailable = 0;

  for (const group of Object.values(groups)) {
    const allFilesForProduct = [
      ...Object.values(group.namedAngles),
      ...Object.values(group.degreeAngles),
    ];
    totalAvailable += allFilesForProduct.length;

    const picks = [];
    if (group.namedAngles.fr_noshad) picks.push(group.namedAngles.fr_noshad);
    if (group.namedAngles.qt_noshad) picks.push(group.namedAngles.qt_noshad);

    if (picks.length === 0) {
      if (group.degreeAngles["000"]) picks.push(group.degreeAngles["000"]);
      if (group.degreeAngles["030"]) picks.push(group.degreeAngles["030"]);
    }

    if (picks.length === 0 && allFilesForProduct.length > 0) {
      picks.push(allFilesForProduct[0]);
    }

    selected.push(...picks);
    skippedCount += allFilesForProduct.length - picks.length;
  }

  return {
    selected,
    unmatched,
    productCount: Object.keys(groups).length,
    skippedCount,
    totalAvailable,
  };
}

function saveResults(outputPath, results) {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
}

async function uploadBrandFolder(brand) {
  const folder = path.join(PROJECT_ROOT, "data", "images", brand);
  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    return false;
  }

  const allFiles = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const {
    selected,
    unmatched,
    productCount,
    skippedCount,
    totalAvailable,
  } = groupAndSelectImages(allFiles);

  console.log(`\nBrand: ${brand}`);
  console.log(`  ${productCount} products, ${totalAvailable} grouped images`);
  console.log(`  Selected ${selected.length}, skipping ${skippedCount}`);
  if (unmatched.length > 0) {
    console.log(`  Warning: ${unmatched.length} files did not match any pattern`);
    console.log(`    e.g. ${unmatched.slice(0, 3).join(", ")}`);
  }

  let filesToProcess = selected;
  if (limit != null && Number.isFinite(limit) && limit > 0) {
    filesToProcess = selected.slice(0, limit);
    console.log(`  Limiting to first ${filesToProcess.length} uploads`);
  }

  if (dryRun) {
    console.log("  Dry run — no uploads.");
    console.log(`  Would upload:`);
    for (const file of filesToProcess.slice(0, 10)) {
      console.log(`    ${file}`);
    }
    if (filesToProcess.length > 10) {
      console.log(`    ... and ${filesToProcess.length - 10} more`);
    }
    return true;
  }

  const outputDir = path.join(PROJECT_ROOT, "data", "image_batches", brand);
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "image_urls.json");
  const results = {};
  if (fs.existsSync(outputPath)) {
    Object.assign(results, JSON.parse(fs.readFileSync(outputPath, "utf8")));
  }

  let uploaded = 0;
  let skippedExisting = 0;
  let failed = 0;

  for (const file of filesToProcess) {
    if (results[file]) {
      skippedExisting++;
      continue;
    }

    try {
      const url = await uploadOneImage(path.join(folder, file));
      results[file] = url;
      uploaded++;
      saveResults(outputPath, results);
      if ((uploaded + skippedExisting) % 10 === 0) {
        console.log(
          `  Progress: ${uploaded} uploaded, ${skippedExisting} skipped, ${failed} failed`,
        );
      }
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${file} -> ${err.message}`);
    }
  }

  console.log(
    `  Done: ${uploaded} uploaded, ${skippedExisting} already had URLs, ${failed} failed`,
  );
  console.log(`  Saved to: ${outputPath}`);
  return true;
}

async function main() {
  if (uploadAll) {
    for (const brand of BRAND_FOLDERS) {
      const folder = path.join(PROJECT_ROOT, "data", "images", brand);
      if (!fs.existsSync(folder)) continue;
      await uploadBrandFolder(brand);
    }
    return;
  }

  const brand = positional[0];
  if (!brand) {
    console.error("Usage:");
    console.error("  node scripts/upload-images-to-shopify.js <brand> [--dry-run] [--limit N]");
    console.error("  node scripts/upload-images-to-shopify.js --all [--dry-run]");
    console.error("");
    console.error("Examples:");
    console.error("  node scripts/upload-images-to-shopify.js swarovski --dry-run");
    console.error("  node scripts/upload-images-to-shopify.js swarovski --limit 3");
    console.error("  node scripts/upload-images-to-shopify.js rayban");
    process.exit(1);
  }

  const ok = await uploadBrandFolder(brand);
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
