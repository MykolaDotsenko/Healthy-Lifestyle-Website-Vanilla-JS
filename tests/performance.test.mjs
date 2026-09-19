import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, menu] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/features/menu.js"), "utf8"),
]);

test("only one authored raster image is eager on initial HTML load", async () => {
  const rasterImages = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+\.(?:jpg|jpeg|png))"[^>]*>/gi)]
    .map((match) => ({ src: match[1], tag: match[0] }));

  const eager = rasterImages.filter(({ tag }) => !/\bloading="lazy"/.test(tag));

  assert.equal(eager.length, 1);
  assert.equal(eager[0].src, "img/tabs/vegy.jpg");
  assert.match(eager[0].tag, /fetchpriority="high"/);
  assert.match(eager[0].tag, /decoding="async"/);

  const eagerBytes = (await stat(resolve(root, eager[0].src))).size;
  assert.ok(eagerBytes <= 400_000, `initial eager raster budget exceeded: ${eagerBytes} bytes`);
});

test("all below-fold authored raster images lazy-load and decode asynchronously", () => {
  const rasterTags = [...html.matchAll(/<img\b[^>]*\bsrc="[^"]+\.(?:jpg|jpeg|png)"[^>]*>/gi)]
    .map((match) => match[0]);

  for (const tag of rasterTags.slice(1)) {
    assert.match(tag, /loading="lazy"/);
    assert.match(tag, /decoding="async"/);
  }
});

test("dynamically rendered menu images use browser-native lazy loading", () => {
  assert.match(menu, /image\.loading = "lazy"/);
  assert.match(menu, /image\.decoding = "async"/);
});
