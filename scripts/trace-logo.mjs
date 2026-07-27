import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import potrace from "potrace";
import sharp from "sharp";

const trace = promisify(potrace.trace);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input =
  process.argv[2] ??
  path.join(root, "public/logo-source.png");
const output = path.join(root, "src/assets/iwear-logo.svg");

async function traceLogo() {
  // Isolate the black mark on red: darken reds, keep logo as solid black silhouette.
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bitmap = Buffer.alloc(width * height);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];

    const isWhiteLogo = r > 240 && g > 240 && b > 240;
    const isBlackLogo = r < 80 && g < 80 && b < 80;
    const isLogo = input.includes("white-on-red") ? isWhiteLogo : isBlackLogo;

    bitmap[i] = isLogo ? 0 : 255;
  }

  const png = await sharp(bitmap, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  const svg = await trace(png, {
    turdSize: 2,
    optTolerance: 0.2,
    color: "currentColor",
    background: "transparent",
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, svg);

  console.log(`Traced logo saved to ${output}`);
}

traceLogo().catch((error) => {
  console.error(error);
  process.exit(1);
});
