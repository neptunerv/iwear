const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token =
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ??
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-07";
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

const QUERY = `
query GetProducts($first: Int!, $query: String, $after: String) {
  products(first: $first, query: $query, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      tags
      featuredImage { url }
      images(first: 1) { nodes { url } }
      variants(first: 3) { nodes { image { url } } }
    }
  }
}`;

async function fetchBrand(brand) {
  const products = [];
  let after = null;
  let hasNextPage = true;
  let guard = 0;
  while (hasNextPage && guard < 100) {
    guard += 1;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { first: 100, query: `vendor:'${brand}'`, after },
      }),
    });
    const json = await res.json();
    const page = json.data.products;
    products.push(...page.nodes);
    hasNextPage = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }
  return products;
}

function hasImage(p) {
  if (p.featuredImage?.url) return true;
  if (p.images?.nodes?.some((i) => i.url)) return true;
  return p.variants?.nodes?.some((v) => v.image?.url);
}

const skipNorm = new Set([
  "oakley",
  "rectangle",
  "square",
  "round",
  "oval",
  "shield",
  "irregular",
  "pillow",
  "phantos",
  "pilot",
  "cateye",
  "optical",
  "opticalrx",
  "rx",
  "prescription",
  "sunglasses",
  "polarized",
]);

async function main() {
  const products = (await fetchBrand("Oakley")).filter(hasImage);
  const tagCounts = {};
  for (const p of products) {
    for (const tag of p.tags) {
      const key = tag.trim();
      if (!key) continue;
      const n = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (skipNorm.has(n)) continue;
      tagCounts[key] = (tagCounts[key] || 0) + 1;
    }
  }
  const top = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);
  console.log(JSON.stringify({ imaged: products.length, topModelishTags: top }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
