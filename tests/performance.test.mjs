import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, menu, manifestRaw] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/features/menu.js"), "utf8"),
  readFile(resolve(root, "img/optimized/manifest.json"), "utf8"),
]);
const manifest = JSON.parse(manifestRaw);

test("optimized image manifest is deterministic and pinned", () => {
  assert.equal(manifest.generator, "sharp@0.35.4");
  assert.equal("generatedAt" in manifest, false);
});

test("each source raster has responsive AVIF and WebP derivatives", async () => {
  for (const image of Object.values(manifest.images)) {
    assert.ok(image.sourceWidth > 0);
    assert.ok(image.sourceHeight > 0);

    for (const format of ["avif", "webp"]) {
      const variants = image.variants
        .filter((variant) => variant.format === format)
        .sort((a, b) => a.width - b.width);

      assert.deepEqual(
        variants.map((variant) => variant.width),
        [768, 1440],
      );

      for (const variant of variants) {
        const bytes = (await stat(resolve(root, variant.path))).size;
        assert.equal(bytes, variant.bytes);
        assert.ok(
          bytes < image.sourceBytes,
          `${variant.path} should be smaller than its JPEG source`,
        );
      }
    }
  }
});

test("static content uses picture with AVIF, WebP, JPEG fallback, and intrinsic dimensions", () => {
  assert.equal((html.match(/<picture>/g) ?? []).length, 8);
  assert.equal((html.match(/type="image\/avif"/g) ?? []).length, 8);
  assert.equal((html.match(/type="image\/webp"/g) ?? []).length, 8);

  const rasterTags = [
    ...html.matchAll(/<img\b[^>]*\bsrc="[^"]+\.(?:jpg|jpeg|png)"[^>]*>/gi),
  ].map((match) => match[0]);

  for (const tag of rasterTags) {
    assert.match(tag, /\bwidth="\d+"/);
    assert.match(tag, /\bheight="\d+"/);
    assert.match(tag, /\bdecoding="async"/);
  }
});

test("the eager hero-adjacent image uses a modern asset budget", () => {
  const active = manifest.images["img/tabs/vegy.jpg"];
  const avif768 = active.variants.find(
    (variant) => variant.format === "avif" && variant.width === 768,
  );
  const avif1440 = active.variants.find(
    (variant) => variant.format === "avif" && variant.width === 1440,
  );

  assert.ok(avif768.bytes <= 40_000);
  assert.ok(avif1440.bytes <= 90_000);

  assert.match(
    html,
    /img\/optimized\/tabs\/vegy-768\.avif 768w, img\/optimized\/tabs\/vegy-1440\.avif 1440w/,
  );
  assert.match(html, /fetchpriority="high"/);
});

test("below-fold JPEG fallbacks remain lazy and asynchronously decoded", () => {
  const rasterTags = [
    ...html.matchAll(/<img\b[^>]*\bsrc="[^"]+\.(?:jpg|jpeg|png)"[^>]*>/gi),
  ].map((match) => match[0]);

  const eager = rasterTags.filter((tag) => !/\bloading="lazy"/.test(tag));
  assert.equal(eager.length, 1);

  for (const tag of rasterTags.filter((tag) => /\bloading="lazy"/.test(tag))) {
    assert.match(tag, /decoding="async"/);
  }
});

test("dynamic menu cards build responsive picture sources and preserve fallback metadata", () => {
  assert.match(menu, /document\.createElement\("picture"\)/);
  assert.match(menu, /source\.type = `image\/\$\{type\}`/);
  assert.match(menu, /-768\.\$\{type\} 768w/);
  assert.match(menu, /-1440\.\$\{type\} 1440w/);
  assert.match(menu, /image\.width = item\.imageWidth/);
  assert.match(menu, /image\.height = item\.imageHeight/);
  assert.match(menu, /image\.loading = "lazy"/);
});
