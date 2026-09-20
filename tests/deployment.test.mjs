import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [quality, pages, brandBuilder] = await Promise.all([
  readFile(resolve(root, ".github/workflows/quality.yml"), "utf8"),
  readFile(resolve(root, ".github/workflows/pages.yml"), "utf8"),
  readFile(resolve(root, "scripts/build-brand-assets.mjs"), "utf8"),
]);

test("Quality derives brand assets from the verified UI screenshot", () => {
  assert.match(quality, /sharp@0\.35\.4/);
  assert.match(quality, /node scripts\/build-brand-assets\.mjs/);
  assert.match(quality, /artifacts\/visual-audit\/\*\.png/);
  assert.match(quality, /artifacts\/brand\/\*\.png/);

  assert.match(
    brandBuilder,
    /artifacts\/visual-audit\/desktop-1440-fold\.png/,
  );
  assert.match(brandBuilder, /nourishflow-readme-preview\.png/);
  assert.match(brandBuilder, /nourishflow-og\.png/);
});

test("Pages publishes brand assets only from the successful verified run", () => {
  assert.match(pages, /workflow_run\.conclusion == 'success'/);
  assert.match(pages, /workflow_run\.head_repository\.full_name == github\.repository/);
  assert.match(pages, /workflow_run\.head_sha/);
  assert.match(pages, /actions\/download-artifact@/);
  assert.match(pages, /run-id: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.match(pages, /img\/brand\/nourishflow-og\.png/);
  assert.match(pages, /img\/brand\/nourishflow-readme-preview\.png/);
});
