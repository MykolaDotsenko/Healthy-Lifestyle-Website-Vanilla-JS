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

test("composition root owns explicit callbacks without feature behavior", async () => {
  const app = await read("js/app.js");
  assert.ok(app.trim().split(/\r?\n/).length <= 40);
  assert.doesNotMatch(app, /querySelector|addEventListener|localStorage/);
  assert.match(app, /plan\.setApproach\(approachId\)/);
  assert.match(app, /menu\.setSelectedApproach\(approachId\)/);
  assert.match(app, /onEstimate:\s*plan\.setCalories/);
  assert.match(app, /onRefresh/);
});

test("domain modules stay browser-independent", async () => {
  for (const path of [
    "js/domain/calculator.js",
    "js/domain/meal-plans.js",
    "js/data/meal-approaches.js",
    "js/domain/weekly-cycle.js",
  ]) {
    const source = await read(path);
    assert.doesNotMatch(source, /\bdocument\b|\bwindow\b|\blocalStorage\b/);
  }
});

test("features do not coordinate through a document-level event bus", async () => {
  for (const path of [
    "js/ui/tabs.js",
    "js/features/calculator.js",
    "js/features/menu.js",
    "js/features/plan.js",
    "js/features/timer.js",
  ]) {
    const source = await read(path);
    assert.doesNotMatch(source, /CustomEvent|nourishflow:/);
  }
});

test("plan persistence stays behind a small storage adapter", async () => {
  const plan = await read("js/features/plan.js");
  const storage = await read("js/features/plan-storage.js");

  assert.match(plan, /\.\/plan-storage\.js/);
  assert.match(storage, /nourishflow\.saved-plan/);
  assert.doesNotMatch(storage, /document\.|querySelector/);
});

test("legacy monolith and obsolete forms feature are removed", async () => {
  await assert.rejects(access(resolve(root, "js/script.js")));
  await assert.rejects(access(resolve(root, "js/features/forms.js")));
});
