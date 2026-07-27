import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import potrace from "potrace";
import sharp from "sharp";

const trace = promisify(potrace.trace);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = process.argv[2] ?? path.join(root, "public/logo-full-source.jpg");
const output =
  process.argv[3] ?? path.join(root, "src/assets/iwear-wordmark.svg");

async function traceLogo() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bitmap = Buffer.alloc(width * height);

  // White wordmark on red background: isolate by "whiteness" (high, balanced RGB),
  // tolerant of JPEG compression artifacts at glyph edges.
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const min = Math.min(r, g, b);
    const isWhite = min > 150;
    bitmap[i] = isWhite ? 0 : 255;
  }

  const png = await sharp(bitmap, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  const svg = await trace(png, {
    turdSize: 8,
    optTolerance: 0.3,
    threshold: 128,
    color: "currentColor",
    background: "transparent",
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, svg);

  console.log(`Traced wordmark saved to ${output}`);
}

traceLogo().catch((error) => {
  console.error(error);
  process.exit(1);
});
