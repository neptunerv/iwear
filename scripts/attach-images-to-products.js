/**
 * attach-images-to-products.js
 *
 * Attaches already-uploaded Shopify CDN images (from data/image_batches/<brand>/image_urls.json)
 * to existing products that are missing media, via Admin API productUpdate.
 *
 * Matching (same as prior CSV import):
 *   SKU OO9400-1068  ->  image key 0OO9400__940010
 *   Prefer fr/qt noshad; else 000A/030A; else first available URL.
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_URL=your-store.myshopify.com
 *   SHOPIFY_ACCESS_TOKEN=shpat_...
 *
 * Usage:
 *   node scripts/attach-images-to-products.js oakley --dry-run
 *   node scripts/attach-images-to-products.js oakley --limit 5
 *   node scripts/attach-images-to-products.js oakley
 *   node scripts/attach-images-to-products.js oakley --only-missing
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

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const dryRun = flags.has("--dry-run");
const onlyMissing = flags.has("--only-missing") || !flags.has("--all-products");
const limitArg = args.find((a) => a.startsWith("--limit"));
const limit = limitArg
  ? Number(limitArg.split("=")[1] ?? args[args.indexOf(limitArg) + 1])
  : null;

if (!STORE || !TOKEN) {
  console.error("Missing SHOPIFY_STORE_URL or SHOPIFY_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const brand = positional[0];
if (!brand) {
  console.error("Usage: node scripts/attach-images-to-products.js <brand> [--dry-run] [--limit N] [--only-missing]");
  process.exit(1);
}

const GRAPHQL_URL = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;
const batchDir = path.join(PROJECT_ROOT, "data", "image_batches", brand);
const urlMapPath = path.join(batchDir, "image_urls.json");
const progressPath = path.join(batchDir, "attach_progress.json");
const coveragePath = path.join(batchDir, "zip_coverage.json");

async function shopifyGraphQL(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function selectUrlsForKey(imageKey, urlMap) {
  const named = {};
  const degree = {};

  for (const [filename, url] of Object.entries(urlMap)) {
    let m = filename.match(
      /^(0[A-Z0-9]+__[A-Z0-9_]+?)__(P21|STD)__(noshad|shad)__([a-z0-9]+)\.jpg$/i,
    );
    if (m && m[1].toUpperCase() === imageKey.toUpperCase()) {
      named[`${m[4].toLowerCase()}_${m[3].toLowerCase()}`] = { filename, url };
      continue;
    }
    m = filename.match(/^(0[A-Z0-9]+__[A-Z0-9_]+)_(\d{3})A\.jpg$/i);
    if (m && m[1].toUpperCase() === imageKey.toUpperCase()) {
      degree[m[2]] = { filename, url };
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

function loadTargets() {
  // Prefer coverage JSON from the zip analysis (only newly-covered missing products).
  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
    return coverage.satisfied.map((s) => ({
      handle: s.handle,
      sku: s.sku,
      title: s.title,
      imageKey: s.img_key,
    }));
  }

  // Fallback: derive from import spreadsheet via a simple CSV if present.
  throw new Error(
    `Missing ${coveragePath}. Re-run coverage analysis or pass targets another way.`,
  );
}

async function findProductBySku(sku) {
  const data = await shopifyGraphQL(
    `query FindVariantBySku($query: String!) {
      productVariants(first: 1, query: $query) {
        nodes {
          id
          sku
          product {
            id
            handle
            title
            media(first: 1) { nodes { id } }
          }
        }
      }
    }`,
    { query: `sku:${sku}` },
  );
  return data.productVariants.nodes[0] || null;
}

async function attachMedia(productId, mediaInputs) {
  const data = await shopifyGraphQL(
    `mutation AttachProductMedia($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
      productUpdate(product: $product, media: $media) {
        product {
          id
          handle
          media(first: 5) {
            nodes {
              alt
              mediaContentType
              ... on MediaImage { image { url } }
            }
          }
        }
        userErrors { field message }
      }
    }`,
    {
      product: { id: productId },
      media: mediaInputs,
    },
  );
  const errs = data.productUpdate.userErrors;
  if (errs?.length) throw new Error(JSON.stringify(errs));
  return data.productUpdate.product;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(urlMapPath)) {
    console.error(`URL map not found: ${urlMapPath}`);
    console.error("Run: node scripts/upload-images-to-shopify.js", brand);
    process.exit(1);
  }

  const urlMap = JSON.parse(fs.readFileSync(urlMapPath, "utf8"));
  const progress = fs.existsSync(progressPath)
    ? JSON.parse(fs.readFileSync(progressPath, "utf8"))
    : {};

  let targets = loadTargets();
  console.log(`Brand: ${brand}`);
  console.log(`URL map entries: ${Object.keys(urlMap).length}`);
  console.log(`Targets from coverage: ${targets.length}`);

  // Enrich / filter by whether CDN URLs exist for the image key
  const ready = [];
  const waitingUpload = [];
  for (const t of targets) {
    const picks = selectUrlsForKey(t.imageKey, urlMap);
    if (picks.length === 0) waitingUpload.push(t);
    else ready.push({ ...t, picks });
  }
  console.log(`Ready to attach (have CDN URLs): ${ready.length}`);
  console.log(`Waiting on upload: ${waitingUpload.length}`);
  if (waitingUpload.length > 0 && waitingUpload.length <= 10) {
    console.log(
      "  e.g.",
      waitingUpload.map((t) => t.sku).join(", "),
    );
  }

  let work = ready;
  if (limit != null && Number.isFinite(limit) && limit > 0) {
    work = work.slice(0, limit);
    console.log(`Limiting to ${work.length}`);
  }

  if (dryRun) {
    console.log("Dry run — no attaches.");
    for (const t of work.slice(0, 15)) {
      console.log(
        `  ${t.sku} -> ${t.picks.map((p) => p.filename).join(", ")}`,
      );
    }
    if (work.length > 15) console.log(`  ... and ${work.length - 15} more`);
    return;
  }

  let attached = 0;
  let skippedHasMedia = 0;
  let skippedDone = 0;
  let failed = 0;
  let notFound = 0;

  for (const t of work) {
    if (progress[t.sku]?.ok) {
      skippedDone++;
      continue;
    }

    try {
      const variant = await findProductBySku(t.sku);
      if (!variant) {
        notFound++;
        progress[t.sku] = { ok: false, error: "variant_not_found" };
        console.error(`  NOT FOUND: ${t.sku}`);
        fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
        continue;
      }

      const product = variant.product;
      const hasMedia = (product.media?.nodes?.length || 0) > 0;
      if (onlyMissing && hasMedia) {
        skippedHasMedia++;
        progress[t.sku] = {
          ok: true,
          skipped: "already_has_media",
          productId: product.id,
        };
        fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
        continue;
      }

      const mediaInputs = t.picks.map((p) => ({
        originalSource: p.url,
        mediaContentType: "IMAGE",
        alt: t.title || t.sku,
      }));

      await attachMedia(product.id, mediaInputs);
      attached++;
      progress[t.sku] = {
        ok: true,
        productId: product.id,
        handle: product.handle,
        files: t.picks.map((p) => p.filename),
      };
      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

      if (attached % 10 === 0) {
        console.log(
          `  Progress: ${attached} attached, ${skippedHasMedia} already had media, ${skippedDone} resumed, ${notFound} missing, ${failed} failed`,
        );
      }
      // gentle rate limit
      await sleep(250);
    } catch (err) {
      failed++;
      progress[t.sku] = { ok: false, error: String(err.message || err) };
      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
      console.error(`  FAILED: ${t.sku} -> ${err.message}`);
      await sleep(500);
    }
  }

  console.log(
    `Done: ${attached} attached, ${skippedHasMedia} already had media, ${skippedDone} already done, ${notFound} not found, ${failed} failed, ${waitingUpload.length} still waiting on CDN upload`,
  );
  console.log(`Progress saved: ${progressPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
