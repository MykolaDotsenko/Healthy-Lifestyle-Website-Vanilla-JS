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

test("README presents the useful product flow before engineering detail", () => {
  assert.match(readme, /^# NourishFlow/m);
  assert.match(readme, /## Product/);
  assert.match(readme, /Morning, Midday, and Evening/);
  assert.match(readme, /save one plan locally/i);
  assert.match(readme, /Privacy and product integrity/);
  assert.match(readme, /img\/brand\/nourishflow-readme-preview\.png/);
  assert.doesNotMatch(
    readme,
    /Request forms are local-only demos|Current feature baseline|Known baseline limitations/,
  );
});

test("architecture documentation matches explicit composition and persistence", () => {
  assert.match(architecture, /domain\/calculator\.js/);
  assert.match(architecture, /plan-storage\.js/);
  assert.match(architecture, /onChange/);
  assert.match(architecture, /onEstimate/);
  assert.match(architecture, /onRefresh/);
  assert.match(architecture, /Monday 09:00 boundary/i);
  assert.match(architecture, /Deliberate non-goals/);
  assert.doesNotMatch(architecture, /document-level event bus.*used/i);
});

test("quality documentation names executable browser and visual gates", () => {
  assert.match(quality, /Automated accessibility/);
  assert.match(quality, /Chromium/);
  assert.match(quality, /Firefox/);
  assert.match(quality, /WebKit/);
  assert.match(quality, /320 × 800/);
  assert.match(quality, /Visual audit artifacts/);
  assert.match(quality, /nourishflow-visual-audit/);
});

test("package and repository license/description agree with current product", () => {
  const packageJson = JSON.parse(pkg);

  assert.equal(packageJson.license, "ISC");
  assert.match(packageJson.description, /NourishFlow/);
  assert.match(license, /ISC License/);
  assert.match(license, /Mykola Dotsenko/);
});
