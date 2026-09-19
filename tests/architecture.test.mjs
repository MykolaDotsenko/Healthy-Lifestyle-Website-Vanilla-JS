import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

const modules = [
  "js/app.js",
  "js/ui/tabs.js",
  "js/ui/modal.js",
  "js/features/timer.js",
  "js/features/menu.js",
  "js/features/forms.js",
  "js/features/carousel.js",
  "js/features/calculator.js",
];

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

test("HTML loads one native ES-module entry point", async () => {
  const html = await read("index.html");

  assert.match(html, /<script type="module" src="js\/app\.js"><\/script>/);
  assert.doesNotMatch(html, /js\/script\.js/);
});

test("composition root stays intentionally small", async () => {
  const app = await read("js/app.js");
  const lines = app.trim().split(/\r?\n/);

  assert.ok(lines.length <= 24, `app.js grew to ${lines.length} lines`);

  for (const name of [
    "initTabs",
    "initTimer",
    "initModal",
    "renderMenu",
    "initForms",
    "initCarousel",
    "initCalculator",
  ]) {
    assert.match(app, new RegExp(`\\b${name}\\b`));
  }
});

test("feature modules remain focused and reviewable", async () => {
  for (const modulePath of modules.slice(1)) {
    const source = await read(modulePath);
    const lines = source.trim().split(/\r?\n/);

    assert.ok(
      lines.length <= 170,
      `${modulePath} is ${lines.length} lines; split responsibilities before growing further`,
    );
    assert.doesNotMatch(source, /window\.addEventListener\("DOMContentLoaded"/);
  }
});

test("feature modules do not form an import graph behind app.js", async () => {
  for (const modulePath of modules.slice(1)) {
    const source = await read(modulePath);
    assert.doesNotMatch(
      source,
      /^import\s/m,
      `${modulePath} should be composed by app.js rather than importing sibling features`,
    );
  }
});

test("legacy monolith is removed", async () => {
  await assert.rejects(access(resolve(root, "js/script.js")));
});
