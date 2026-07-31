#!/usr/bin/env python3
"""Build Ray-Ban image-update CSV (full 33 headers, prices from last import)."""
import csv, json, re, os
from collections import defaultdict

ROOT = os.path.join(os.path.dirname(__file__), "..")
IMPORT = "/Users/vittorihuang/Downloads/shopify import 07:25/rayban/RayBan_FINAL_Shopify_Import.csv"
COVERAGE = os.path.join(ROOT, "data/image_batches/rayban/zip_coverage.json")
URL_MAP = os.path.join(ROOT, "data/image_batches/rayban/image_urls.json")
OUT = os.path.join(ROOT, "data/image_batches/rayban/image_update.csv")

named = re.compile(
    r"^(0[A-Z0-9]+__[A-Z0-9_]+?)__(P21|STD)__(noshad|shad)__([a-z0-9]+)\.jpg$",
    re.I,
)
degree = re.compile(r"^(0[A-Z0-9]+__[A-Z0-9_]+)_(\d{3})A\.jpg$", re.I)


def select_urls(image_key, url_map):
    named_angles, degree_angles = {}, {}
    key_u = image_key.upper()
    for filename, url in url_map.items():
        m = named.match(filename)
        if m and m.group(1).upper() == key_u:
            named_angles[f"{m.group(4).lower()}_{m.group(3).lower()}"] = url
            continue
        m = degree.match(filename)
        if m and m.group(1).upper() == key_u:
            degree_angles[m.group(2)] = url
    picks = []
    if "fr_noshad" in named_angles:
        picks.append(named_angles["fr_noshad"])
    if "qt_noshad" in named_angles:
        picks.append(named_angles["qt_noshad"])
    if not picks:
        if "000" in degree_angles:
            picks.append(degree_angles["000"])
        if "030" in degree_angles:
            picks.append(degree_angles["030"])
    if not picks:
        any_url = next(iter(named_angles.values()), None) or next(
            iter(degree_angles.values()), None
        )
        if any_url:
            picks.append(any_url)
    return picks


def main():
    cov = json.load(open(COVERAGE))
    url_map = json.load(open(URL_MAP))

    # Index import by handle — keep first row with SKU as the product base row
    with open(IMPORT, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        by_handle = {}
        for row in reader:
            h = (row.get("Handle") or "").strip()
            if not h:
                continue
            if h not in by_handle:
                by_handle[h] = row
            elif not (by_handle[h].get("Variant SKU") or "").strip() and (
                row.get("Variant SKU") or ""
            ).strip():
                by_handle[h] = row

    out_rows = []
    waiting = 0
    with_images = 0
    for item in cov["satisfied"]:
        handle = item["handle"]
        base = by_handle.get(handle)
        if not base:
            print(f"WARN missing import row for {handle}")
            continue
        urls = select_urls(item["img_key"], url_map)
        if not urls:
            waiting += 1
            continue
        with_images += 1
        for i, url in enumerate(urls):
            if i == 0:
                row = {h: base.get(h, "") for h in headers}
                # Blank inventory so stock isn't reset (same as Oakley fix)
                row["Variant Inventory Qty"] = ""
                row["Image Src"] = url
                out_rows.append(row)
            else:
                # Extra image rows: handle + image only
                row = {h: "" for h in headers}
                row["Handle"] = handle
                row["Image Src"] = url
                out_rows.append(row)

    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        w.writerows(out_rows)

    print(
        f"Wrote {OUT}: {with_images} products, {len(out_rows)} rows, {waiting} waiting on CDN"
    )


if __name__ == "__main__":
    main()
