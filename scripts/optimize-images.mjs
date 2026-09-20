import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

// Generated assets are reproducible from the original JPEG sources.

const root = new URL("../", import.meta.url);
const outputRoot = new URL("../img/optimized/", import.meta.url);

const sources = [
  "img/tabs/vegy.jpg",
  "img/tabs/elite.jpg",
  "img/tabs/post.jpg",
  "img/slider/pepper.jpg",
  "img/slider/food-12.jpg",
  "img/slider/olive-oil.jpg",
  "img/slider/paprika.jpg",
];

const requestedWidths = [768, 1440];
const FORMAT_OPTIONS = Object.freeze({
  avif: Object.freeze({ quality: 50, effort: 6 }),
  webp: Object.freeze({ quality: 80, effort: 6, smartSubsample: true }),
});

const manifest = {
  generator: "sharp@0.35.4",
  formats: FORMAT_OPTIONS,
  images: {},
};

let sourceBytes = 0;
let generatedBytes = 0;

for (const sourcePath of sources) {
  const input = fileURLToPath(new URL(sourcePath, root));
  const metadata = await sharp(input).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Missing image dimensions for ${sourcePath}`);
  }

  const sourceStat = await stat(input);
  sourceBytes += sourceStat.size;

  const sourceName = basename(sourcePath, extname(sourcePath));
  const group = sourcePath.includes("/tabs/") ? "tabs" : "slider";
  const actualWidths = [
    ...new Set(
      requestedWidths.map((width) => Math.min(width, metadata.width)),
    ),
  ].sort((a, b) => a - b);

  const record = {
    source: sourcePath,
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    sourceBytes: sourceStat.size,
    variants: [],
  };

  for (const width of actualWidths) {
    for (const format of ["avif", "webp"]) {
      const relativePath = join(
        "img",
        "optimized",
        group,
        `${sourceName}-${width}.${format}`,
      );
      const output = fileURLToPath(new URL(relativePath, root));

      await mkdir(dirname(output), { recursive: true });

      let pipeline = sharp(input)
        .rotate()
        .resize({
          width,
          withoutEnlargement: true,
          fit: "inside",
        });

      pipeline = pipeline[format](FORMAT_OPTIONS[format]);

      const info = await pipeline.toFile(output);
      const outputStat = await stat(output);
      generatedBytes += outputStat.size;

      record.variants.push({
        format,
        width: info.width,
        height: info.height,
        path: relativePath.replaceAll("\\", "/"),
        bytes: outputStat.size,
      });
    }
  }

  manifest.images[sourcePath] = record;
}

await mkdir(outputRoot, { recursive: true });
await writeFile(
  fileURLToPath(new URL("manifest.json", outputRoot)),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      sourceBytes,
      generatedBytes,
      generatedPercentOfSources: Number(
        ((generatedBytes / sourceBytes) * 100).toFixed(1),
      ),
      imageCount: sources.length,
    },
    null,
    2,
  ),
);
