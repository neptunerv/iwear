import type { Metafield, Product } from "@/lib/shopify";

export type ProductSpecRow = {
  key: string;
  label: string;
  value: string;
};

/** All customer-facing `specs.*` metafields, in display order. */
const SPEC_FIELDS: { key: string; label: string; unit?: string }[] = [
  { key: "gender", label: "Gender" },
  { key: "shape", label: "Shape" },
  { key: "polarized", label: "Polarized" },
  { key: "frame_material", label: "Frame material" },
  { key: "lens_material", label: "Lens material" },
  { key: "lens_color", label: "Lens color" },
  { key: "temple_material", label: "Temple material" },
  { key: "geofit", label: "Fit" },
  { key: "lens_width_mm", label: "Lens width", unit: "mm" },
  { key: "lens_height_mm", label: "Lens height", unit: "mm" },
  { key: "bridge_size_mm", label: "Bridge size", unit: "mm" },
  { key: "temple_length_mm", label: "Temple length", unit: "mm" },
];

/**
 * `front_colour` and `lens_color` metafields are often frozen per model
 * *group*, not per SKU (e.g. every RB0101 colorway reports "Arista Gold").
 * Prefer title/description. Trust the metafield only when it agrees with
 * the per-SKU parse (or when no parse is available).
 */
const UNRELIABLE_METAFIELD_KEYS = new Set(["front_colour", "lens_color"]);

function normalizeCompareKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Prefer the per-SKU parsed value; fall back to the metafield when it looks
 * consistent (same tokens) or when parsing failed.
 */
function resolveColorField(
  parsed: string | null,
  metafieldRaw: string | null,
): string | null {
  if (parsed && metafieldRaw) {
    const a = normalizeCompareKey(parsed);
    const b = normalizeCompareKey(metafieldRaw);
    if (a === b || a.includes(b) || b.includes(a)) return parsed;
    return parsed;
  }
  return parsed ?? metafieldRaw;
}

/** Known catalog codes → customer-facing labels. */
const SPEC_VALUE_ALIASES: Record<string, string> = {
  o_matter: "O-Matter",
  "o-matter": "O-Matter",
  omatter: "O-Matter",
  c_5: "C-5",
  "c-5": "C-5",
  c5: "C-5",
  nt_plastic: "NT Plastic",
  "nt-plastic": "NT Plastic",
  propionate: "Propionate",
  acetate: "Acetate",
  aluminium: "Aluminium",
  aluminum: "Aluminum",
  polycarbonate: "Polycarbonate",
  polyamide: "Polyamide",
  nylon: "Nylon",
  titanium: "Titanium",
  metal: "Metal",
  injected: "Injected",
};

const LENS_TOKEN_ALIASES: Record<string, string> = {
  prizm: "Prizm",
  prizmblack: "Prizm Black",
  prizmroad: "Prizm Road",
  prizmtrail: "Prizm Trail",
  prizmdeepwater: "Prizm Deep Water",
  prizmsapphire: "Prizm Sapphire",
  prizmruby: "Prizm Ruby",
  prizmtungsten: "Prizm Tungsten",
  prizmjade: "Prizm Jade",
  prizm24k: "Prizm 24K",
  gry: "Grey",
  grey: "Grey",
  gray: "Grey",
  grygradient: "Grey Gradient",
  grd: "Gradient",
  grdl: "Gradient",
  gradient: "Gradient",
  mirr: "Mirror",
  mirror: "Mirror",
  silv: "Silver",
  silver: "Silver",
  azure: "Azure",
  internal: "Internal",
  blu: "Blue",
  blue: "Blue",
  light: "Light",
  dark: "Dark",
  green: "Green",
  grn: "Green",
  gn: "Green",
  brown: "Brown",
  brw: "Brown",
  brn: "Brown",
  brwn: "Brown",
  black: "Black",
  clr: "Clear",
  clear: "Clear",
  polarized: "Polarized",
  pol: "Polarized",
  polgrn: "Polarized Green",
  int: "Internal",
  gld: "Gold",
  gold: "Gold",
  brwgradient: "Brown Gradient",
  browngradient: "Brown Gradient",
  grdgrey: "Grey Gradient",
  grdbrown: "Brown Gradient",
  clrgrdbrw: "Clear Gradient Brown",
};

function titleCaseWord(word: string): string {
  if (!word) return word;
  if (/^[A-Z0-9]+$/.test(word) && word.length <= 3) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Turn raw metafield tokens into natural customer copy. */
export function formatSpecLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const aliasKey = trimmed.toLowerCase().replace(/[\s-]+/g, "_");
  if (SPEC_VALUE_ALIASES[aliasKey]) return SPEC_VALUE_ALIASES[aliasKey];

  const spaced = trimmed
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Preserve short codes like "C-5" after underscore→hyphen for letter_digit patterns.
  const hyphenatedCodes = spaced.replace(
    /\b([A-Za-z]+)\s+(\d+)\b/g,
    (_, letters: string, digits: string) => `${letters.toUpperCase()}-${digits}`,
  );

  return hyphenatedCodes
    .split(" ")
    .map((part) => {
      if (part.includes("-")) {
        return part
          .split("-")
          .map((segment) => {
            const key = segment.toLowerCase();
            if (SPEC_VALUE_ALIASES[key]) return SPEC_VALUE_ALIASES[key];
            return titleCaseWord(segment);
          })
          .join("-");
      }
      return titleCaseWord(part);
    })
    .join(" ");
}

function formatMetafieldValue(
  field: Metafield,
  unit?: string,
  formatter: (raw: string) => string = formatSpecLabel,
): string | null {
  if (!field?.value?.trim()) return null;

  const { value, type } = field;

  if (type === "boolean") {
    return value === "true" ? "Yes" : "No";
  }

  if (type.startsWith("list.")) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        const joined = parsed
          .map((item) => formatter(String(item)))
          .filter(Boolean)
          .join(", ");
        return joined || null;
      }
    } catch {
      return formatter(value);
    }
  }

  if (type === "number_decimal" || type === "number_integer") {
    const number = Number(value);
    if (Number.isNaN(number)) return null;
    const formatted = Number.isInteger(number)
      ? String(number)
      : String(number).replace(/\.0+$/, "");
    return unit ? `${formatted} ${unit}` : formatted;
  }

  const label = formatter(value);
  return unit ? `${label} ${unit}` : label;
}

/**
 * Lens color metafield values sometimes arrive as clean text ("Prizm Black"),
 * glued factory codes ("PrizmBlack"), or abbreviated catalog copy
 * ("Polarized Grn,") — always run through the lens formatter.
 */
function formatLensColorValue(raw: string): string {
  return formatLensLabel(raw) ?? formatSpecLabel(raw);
}

const SPEC_FIELD_FORMATTERS: Partial<Record<string, (raw: string) => string>> =
  {
    lens_color: formatLensColorValue,
  };

/**
 * Catalog descriptions look like:
 * "Frame: Matte Black. Lens: PrizmBlack+1NoseP. Unisex / Irregular shape. Fit: …"
 */
export function parseDescriptionDetails(description: string): {
  frame: string | null;
  lens: string | null;
} {
  const text = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return { frame: null, lens: null };

  const frameMatch = text.match(/\bFrame:\s*([^.]+)/i);
  const lensMatch = text.match(/\bLens:\s*([^.]+)/i);

  return {
    frame: frameMatch?.[1]?.trim() ? formatProductColor(frameMatch[1]) : null,
    lens: lensMatch?.[1]?.trim() ? formatLensLabel(lensMatch[1]) : null,
  };
}

/** Clean factory lens codes: PrizmBlack+1NoseP → Prizm Black */
export function formatLensLabel(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  // Drop accessory / size suffixes and trailing size codes.
  value = value
    .replace(/\+?\d*NosePads?/gi, "")
    .replace(/\+?\d*NoseP\b/gi, "")
    .replace(/\.\d{2,3}$/u, "")
    // Catalog copy often trails commas / punctuation: "Polarized Grn,"
    .replace(/[_./,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!value) return null;

  // Prefer whole-string aliases (PrizmBlack, GryGradient, PolGrn).
  const compact = value.toLowerCase().replace(/[\s-]+/g, "");
  if (LENS_TOKEN_ALIASES[compact]) return LENS_TOKEN_ALIASES[compact];

  // Split camelCase / glued tokens: PrizmRoad, AzureInternalMirrSilver
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  const words = spaced.split(/\s+/).flatMap((part) => {
    const key = part.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!key) return [];
    if (LENS_TOKEN_ALIASES[key]) return [LENS_TOKEN_ALIASES[key]];
    if (/^\d+$/.test(part)) return [];
    return [titleCaseWord(key)];
  });

  // Merge "Prizm" + next word when still split oddly.
  const merged: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (
      word.toLowerCase() === "prizm" &&
      words[i + 1] &&
      !/^prizm/i.test(words[i + 1])
    ) {
      merged.push(`Prizm ${words[i + 1]}`);
      i += 1;
      continue;
    }
    merged.push(word);
  }

  return merged.join(" ").replace(/\s+/g, " ").trim() || null;
}

function getMetafieldByKey(product: Product, key: string): Metafield {
  return product.metafields?.find((field) => field?.key === key) ?? null;
}

export function getProductSpecRows(product: Product): ProductSpecRow[] {
  const fromDescription = parseDescriptionDetails(
    product.description || product.descriptionHtml || "",
  );

  const rows: ProductSpecRow[] = [];

  for (const { key, label, unit } of SPEC_FIELDS) {
    let value: string | null = null;

    if (!UNRELIABLE_METAFIELD_KEYS.has(key)) {
      const formatter = SPEC_FIELD_FORMATTERS[key];
      value = formatMetafieldValue(getMetafieldByKey(product, key), unit, formatter);
    }

    // Prefer per-SKU description; use metafield only when it agrees / as fallback.
    if (key === "lens_color") {
      const lensMeta = formatMetafieldValue(
        getMetafieldByKey(product, "lens_color"),
        unit,
        formatLensColorValue,
      );
      value = resolveColorField(fromDescription.lens, lensMeta);
    }

    if (!value) continue;

    // Factory jargon — titles already say "Plastic"; keep Fit & Specs readable.
    if (
      (key === "frame_material" || key === "temple_material") &&
      value.toLowerCase() === "injected"
    ) {
      continue;
    }

    rows.push({ key, label, value });
  }

  return rows;
}

const MATERIAL_PREFIXES = [
  "plastic",
  "metal",
  "acetate",
  "injected",
  "aluminium",
  "aluminum",
  "titanium",
  "nylon",
  "propionate",
  "polyamide",
  "polycarbonate",
  "steel",
];

/** Hyphenated / catalog material prefixes: NT-Plastic, Bio-Metal, Ferrari-Plastic, PlMtl. */
const MATERIAL_PREFIX_RE =
  /^(?:plmtl\.?\s*|(?:(?:nt|nts|ns|nrs|n|lf|pol|bio|photo|ferrari|clubm|chrman|chrnan|lennykravitz|lennykravit|jennie|jeannie|transitions|change|asap.?r\.?)\s*[-.]?\s*)?(?:plastic|metal|acetate|injected|aluminium|aluminum|titanium|nylon|propionate|polyamide|polycarbonate|steel)\b\.?\s*)/i;

const COLOR_TOKEN_ALIASES: Record<string, string> = {
  // Greys
  gry: "Grey",
  grey: "Grey",
  gray: "Grey",
  dgry: "Dark Grey",
  grysmoke: "Grey Smoke",
  greysmoke: "Grey Smoke",
  grysmk: "Grey Smoke",
  gryink: "Grey Ink",
  mgry: "Matte Grey",
  mgryink: "Matte Grey Ink",
  smk: "Smoke",
  smoke: "Smoke",
  // Blacks / whites
  blk: "Black",
  bk: "Black",
  black: "Black",
  mblk: "Matte Black",
  mblack: "Matte Black",
  mbk: "Matte Black",
  mtbk: "Matte Black",
  mtblk: "Matte Black",
  mtblack: "Matte Black",
  bllk: "Black",
  pblk: "Polish Black",
  crystalblk: "Crystal Black",
  crystlblack: "Crystal Black",
  cryblack: "Crystal Black",
  clr: "Clear",
  clear: "Clear",
  wht: "White",
  white: "White",
  // Metals / finishes
  mtl: "Metal",
  gunmtl: "Gun Metal",
  gun: "Gun",
  mgun: "Matte Gun",
  satin: "Satin",
  matte: "Matte",
  matt: "Matte",
  polish: "Polish",
  polished: "Polish",
  plsh: "Polish",
  polis: "Polish",
  // Golds / silvers
  gld: "Gold",
  gold: "Gold",
  mgld: "Matte Gold",
  rosegld: "Rose Gold",
  rosegold: "Rose Gold",
  legendgld: "Legend Gold",
  lgngld: "Legend Gold",
  palegld: "Pale Gold",
  palegold: "Pale Gold",
  silv: "Silver",
  slv: "Silver",
  silver: "Silver",
  brushedsilver: "Brushed Silver",
  // Browns / tortoises / havana
  brw: "Brown",
  brn: "Brown",
  brwn: "Brown",
  brown: "Brown",
  mbrw: "Matte Brown",
  mbrn: "Matte Brown",
  mbrown: "Matte Brown",
  brwsmoke: "Brown Smoke",
  brownsmoke: "Brown Smoke",
  havana: "Havana",
  hvn: "Havana",
  havn: "Havana",
  mediumhavana: "Medium Havana",
  tortoise: "Tortoise",
  tort: "Tortoise",
  blktortoise: "Black Tortoise",
  mocktort: "Mock Tortoise",
  // Transparent / translucency
  transp: "Transparent",
  transparent: "Transparent",
  transparant: "Transparent",
  trans: "Transparent",
  trsn: "Transparent",
  trs: "Transparent",
  trns: "Transparent",
  translucent: "Translucent",
  // Common colors
  blu: "Blue",
  blue: "Blue",
  grn: "Green",
  green: "Green",
  gn: "Green",
  org: "Orange",
  orange: "Orange",
  ylw: "Yellow",
  yellow: "Yellow",
  red: "Red",
  pink: "Pink",
  violet: "Violet",
  beige: "Beige",
  crml: "Caramel",
  caramel: "Caramel",
  sand: "Sand",
  navy: "Navy",
  carbon: "Carbon",
  chrome: "Chrome",
  // Compound / known catalog phrases
  polishblack: "Polish Black",
  polishedblack: "Polish Black",
  polishwhite: "Polish White",
  polishedwhite: "Polish White",
  satinblack: "Satin Black",
  blkin: "Black Ink",
  blkink: "Black Ink",
  universalblue: "Universal Blue",
  transparentstonewash: "Transparent Stonewash",
  transparentlilac: "Transparent Lilac",
  transparentgrey: "Transparent Grey",
  transparentgray: "Transparent Grey",
  transparentbrown: "Transparent Brown",
  transparentbeige: "Transparent Beige",
  transparentgreen: "Transparent Green",
  transparentpink: "Transparent Pink",
  transparentyellow: "Transparent Yellow",
  transpgry: "Transparent Grey",
  transpbrw: "Transparent Brown",
  transgry: "Transparent Grey",
  darkgreen: "Dark Green",
  clrblue: "Clear Blue",
  opalinel: "Opaline Light",
  "opalinel.brown": "Opaline Light Brown",
  opalbrw: "Opal Brown",
  striphvn: "Stripe Havana",
  stripbrw: "Stripe Brown",
  stripgry: "Stripe Grey",
  stripgrn: "Stripe Green",
};

/** Words that only connect color parts — keep lowercase in the label. */
const COLOR_CONNECTORS = new Set(["on", "to", "and"]);

/**
 * Stock spreadsheets embed inventory / channel markers in the color field:
 * `*mp`, `*mp2-Gold`, `*sp1-Black`, `(sp-b)-*sp`, `*(A)-White`, `sp5s-Gold`.
 * None of these are customer-facing color names.
 */
function stripInventoryMarkers(raw: string): string {
  let value = raw.trim();
  if (!value) return "";

  // Trailing stock / qty notes: (*N.2,2), (1,950), (3,2), , 3386
  value = value
    .replace(/,?\s*\(\*?N\.?[\d,\s]+\)-?/gi, "")
    .replace(/,?\s*\([\d,\s]+\)/g, "")
    .replace(/,?\s*-?\s*\d{3,5}\s*$/g, "")
    .trim();

  // Grade markers can appear mid-string: Ferrari-(A)Mtbk, *(A)-Black
  value = value.replace(/\*?\(\s*A\s*\)-?/gi, "");

  let prev = "";
  while (value !== prev) {
    prev = value;
    value = value
      // Channel wrappers: (sp-b), (sp-pz), (AK)
      .replace(/^\*?\(\s*(?:sp-[a-z]+|AK)\s*\)-?\*?/i, "")
      // *mp / *sp / *mp2 / *sp1 / *sps prefixes (optional trailing hyphen)
      .replace(/^\*(?:mp|sp)\d*[a-z]*-?/i, "")
      // Bare sp / sp4 / sp5s / sps / spf / 5s channel codes
      .replace(/^(?:sp\d*[a-z]*|sps|spf|5s)(?:-youth)?-?/i, "")
      // Brand tags glued onto the color: Ferrari-Black, ClubM-Metal …
      .replace(
        /^(?:ferrari|oakley|ray-?ban|clubm|chrman|chrnan|gmg|tld|fortnite|mahomes|sign|seek\s*coll|alloy\s*coll|el\.?\s*diablo|dame\s*dolla|alexia\s*putellas|damianlillard|latitude|astonmartin|joelwisn)\s*-?\s*/i,
        "",
      )
      // Leading stars left after the above
      .replace(/^\*+/, "")
      .replace(/^-+/, "")
      .trim();
  }

  // Drop orphaned size-only leftovers: "40", "30, 40", "58, 10"
  if (/^\d{1,3}(?:\s*,\s*\d{1,3})*$/.test(value)) return "";

  return value;
}

function expandCamelCase(value: string): string {
  return (
    value
      // GrytoClear / BlkOnGld — split connectors before camelCase so
      // "toC" isn't eaten as a normal case break ("Gryto Clear").
      .replace(/([A-Za-z])(to|on)([A-Z])/g, "$1 $2 $3")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Za-z])(\d)/g, "$1 $2")
      .replace(/(\d)([A-Za-z])/g, "$1 $2")
  );
}

function formatColorToken(token: string): string {
  const cleaned = token.replace(/[._]+/g, " ").trim();
  if (!cleaned) return "";

  const aliasKey = cleaned.toLowerCase().replace(/[\s-]+/g, "");
  if (COLOR_TOKEN_ALIASES[aliasKey]) return COLOR_TOKEN_ALIASES[aliasKey];

  const spaced = expandCamelCase(cleaned)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const key = part.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!key) return "";
      if (COLOR_TOKEN_ALIASES[key]) return COLOR_TOKEN_ALIASES[key];
      if (COLOR_CONNECTORS.has(key)) return key;
      if (/^\d+$/.test(part)) return ""; // drop stray size digits
      // Drop lone stock letters that aren't real color words (e.g. leftover "A")
      if (key.length === 1) return "";
      return titleCaseWord(part);
    })
    .filter(Boolean)
    .join(" ");
}

/** Normalize factory/stock color codes into customer-facing labels. */
export function formatProductColor(raw: string): string | null {
  let value = stripInventoryMarkers(raw);
  if (!value) return null;

  // Drop shape / stock notes in parentheses: (Rimless), (Round), (1pc), (Sq)
  value = value.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();

  // Strip trailing lens-size codes: UniversalBlue57, Gun58, 10, Satin Grey Smoke 57
  value = value.replace(/(?:[\s,|-]*)\d{2,3}(?:\s*,\s*\d{2,3})*$/u, "").trim();

  // Drop material prefixes (shown in Fit & Specs instead), including NT-Plastic / Bio-Metal
  let prevMaterial = "";
  while (value !== prevMaterial) {
    prevMaterial = value;
    value = value.replace(MATERIAL_PREFIX_RE, "").trim();
  }
  // Also peel repeated plain material words: "Plastic Matte …"
  const words = value.split(/\s+/).filter(Boolean);
  while (words.length > 0 && MATERIAL_PREFIXES.includes(words[0].toLowerCase())) {
    words.shift();
  }
  value = words.join(" ").trim();
  if (!value) return null;

  // Compact camel tokens: SatinGrySmk / UniversalBlue / TranspBrw
  const formatted = value
    .split(/([\s/,]+)/)
    .map((part) => (/^[\s/,]+$/.test(part) ? " " : formatColorToken(part)))
    .join("")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    // Normalize connectors: "Black On Gold" → "Black on Gold"
    .replace(/\s+[Oo]n\s+/g, " on ")
    .replace(/\s+[Tt]o\s+/g, " to ")
    .trim();

  if (!formatted) return null;

  // Reject leftover junk that isn't a real color label
  const compact = formatted.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!compact) return null;
  if (/^(mp|sp)\d*[a-z]*$/.test(compact)) return null;
  if (compact.length < 3 && !COLOR_TOKEN_ALIASES[compact]) return null;

  return formatted;
}

function formatModelName(raw: string, brand?: string): string {
  let name = raw.trim();
  if (!name) return raw;

  if (brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    const rest = name.slice(brand.length).trim();
    if (rest) {
      name = `${brand} ${rest}`;
    }
  }

  // Title-case words but keep short model codes like "0101" and initials.
  return name
    .split(/\s+/)
    .map((word) => {
      if (/^\d/.test(word) || /^\(.*\)$/.test(word)) return word;
      if (word === word.toUpperCase() && word.length > 3) {
        return titleCaseWord(word.toLowerCase());
      }
      if (word === word.toUpperCase() && word.length <= 3) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export type ProductDisplayTitle = {
  /** e.g. "Oakley Rafter" */
  name: string;
  /** Collection / line before the comma, e.g. "Performance Lifestyle" */
  collection: string | null;
  /** Frame color only, e.g. "Matte Black" */
  color: string | null;
  /** Lens tint from description, e.g. "Prizm Road" */
  lens: string | null;
  /** Combined subtitle for compact UI */
  detail: string | null;
};

/**
 * Parse factory Shopify titles:
 *   "Oakley RAFTER — Performance Lifestyle, Plastic UniversalBlue57"
 * into clean customer-facing parts, and pull lens from the description.
 */
export function getProductDisplayTitle(product: Product): ProductDisplayTitle {
  const brand = product.vendor?.trim() || undefined;
  const parts = product.title.split(/\s+[—–]\s+/);
  const name = formatModelName(parts[0]?.trim() || product.title, brand);

  const remainder = parts.slice(1).join(" — ").trim();
  const fromDescription = parseDescriptionDetails(
    product.description || product.descriptionHtml || "",
  );

  let collection: string | null = null;
  let color: string | null = null;

  if (remainder) {
    const commaIndex = remainder.indexOf(",");
    const collectionRaw =
      commaIndex === -1 ? remainder : remainder.slice(0, commaIndex).trim();
    const afterComma =
      commaIndex === -1 ? "" : remainder.slice(commaIndex + 1).trim();

    collection = collectionRaw ? formatSpecLabel(collectionRaw) : null;
    // Materials belong in Fit & Specs, not the header (e.g. "— Acetate, …").
    if (
      collection &&
      MATERIAL_PREFIXES.includes(collection.toLowerCase().replace(/\s+/g, " "))
    ) {
      collection = null;
    }
    color = afterComma ? formatProductColor(afterComma) : null;
  }

  const frontMeta = formatMetafieldValue(
    getMetafieldByKey(product, "front_colour"),
    undefined,
    (raw) => formatProductColor(raw) ?? formatSpecLabel(raw),
  );
  const lensMeta = formatMetafieldValue(
    getMetafieldByKey(product, "lens_color"),
    undefined,
    formatLensColorValue,
  );

  color = resolveColorField(color ?? fromDescription.frame, frontMeta);
  const lens = resolveColorField(fromDescription.lens, lensMeta);

  const detail =
    [collection, color, lens].filter(Boolean).join(" · ") || null;

  return { name, collection, color, lens, detail };
}
