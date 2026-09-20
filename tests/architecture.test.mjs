import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

test("HTML loads one native ES-module entry point", async () => {
  const html = await read("index.html");
  assert.match(html, /<script type="module" src="js\/app\.js"><\/script>/);
});

test("composition root wires features without owning feature behavior", async () => {
  const app = await read("js/app.js");
  assert.ok(app.trim().split(/\r?\n/).length <= 24);
  assert.doesNotMatch(app, /querySelector|addEventListener|localStorage/);
});

test("domain modules stay browser-independent", async () => {
  for (const path of [
    "js/domain/calculator.js",
    "js/domain/meal-styles.js",
    "js/domain/weekly-cycle.js",
  ]) {
    const source = await read(path);
    assert.doesNotMatch(source, /\bdocument\b|\bwindow\b|\blocalStorage\b/);
  }
});

test("cross-feature coordination uses explicit domain imports or product events", async () => {
  const menu = await read("js/features/menu.js");
  const plan = await read("js/features/plan.js");
  const timer = await read("js/features/timer.js");

  assert.match(menu, /\.\.\/domain\/meal-styles\.js/);
  assert.match(plan, /\.\.\/domain\/meal-styles\.js/);
  assert.match(timer, /\.\.\/domain\/weekly-cycle\.js/);
  assert.match(plan, /nourishflow:meal-style/);
  assert.match(plan, /nourishflow:estimate/);
});

test("legacy monolith and obsolete forms feature are removed", async () => {
  await assert.rejects(access(resolve(root, "js/script.js")));
  await assert.rejects(access(resolve(root, "js/features/forms.js")));
});
