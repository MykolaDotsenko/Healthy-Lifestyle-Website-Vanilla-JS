import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [readme, architecture, quality, license, pkg] = await Promise.all([
  readFile(resolve(root, "README.md"), "utf8"),
  readFile(resolve(root, "ARCHITECTURE.md"), "utf8"),
  readFile(resolve(root, "QUALITY.md"), "utf8"),
  readFile(resolve(root, "LICENSE"), "utf8"),
  readFile(resolve(root, "package.json"), "utf8"),
]);

test("README presents the product before implementation history", () => {
  assert.match(readme, /^# NourishFlow/m);
  assert.match(readme, /Why this project exists/);
  assert.match(readme, /What it demonstrates/);
  assert.match(readme, /Privacy and product integrity/);
  assert.doesNotMatch(readme, /Current feature baseline|Known baseline limitations|later roadmap PRs/);
});

test("architecture documentation matches the current module surface", () => {
  assert.match(architecture, /domain\/calculator\.js/);
  assert.match(architecture, /calculator-storage\.js/);
  assert.doesNotMatch(architecture, /timer\.js/);
  assert.match(architecture, /Deliberate non-goals/);
});

test("quality documentation names executable browser gates", () => {
  assert.match(quality, /Automated accessibility/);
  assert.match(quality, /Chromium/);
  assert.match(quality, /Firefox/);
  assert.match(quality, /WebKit/);
  assert.match(quality, /320 × 800/);
});

test("package and repository license/description agree with current product", () => {
  const packageJson = JSON.parse(pkg);

  assert.equal(packageJson.license, "ISC");
  assert.match(packageJson.description, /NourishFlow/);
  assert.match(license, /ISC License/);
  assert.match(license, /Mykola Dotsenko/);
});
