import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

const [html, app, menu, plan, timer] = await Promise.all([
  read("index.html"),
  read("js/app.js"),
  read("js/features/menu.js"),
  read("js/features/plan.js"),
  read("js/features/timer.js"),
]);

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

test("core product surface stays intact", () => {
  assert.equal(
    countMatches(html, /class="[^"]*\btabheader__item\b[^"]*"/g),
    4,
  );
  assert.equal(countMatches(html, /class="offer__slide"/g), 4);
  assert.equal(countMatches(html, /<form\b/g), 0);
  assert.match(html, />Start My Plan<\/a>/);
  assert.match(html, />Build My Plan<\/button>/);
  assert.match(html, /id="plan-dialog"/);
  assert.match(html, /data-saved-plan/);
});

test("composition owns cross-feature wiring explicitly", () => {
  for (const name of [
    "initTabs",
    "initTimer",
    "initModal",
    "initMenu",
    "initPlan",
    "initCarousel",
    "initCalculator",
  ]) {
    assert.match(app, new RegExp("\\b" + name + "\\b"));
  }

  assert.match(app, /onChange:\s*plan\.setStyle/);
  assert.match(app, /onEstimate:\s*plan\.setCalories/);
  assert.match(app, /onRefresh/);
  assert.match(menu, /getWeeklyMenu/);
  assert.match(plan, /buildPlanSummary/);
  assert.doesNotMatch([app, plan, timer].join("\n"), /CustomEvent|nourishflow:/);
});

test("legacy fake-product mechanics do not return", () => {
  const combined = [html, app, menu, plan].join("\n");

  assert.doesNotMatch(combined, /Preview Request|Portfolio demo|Demo price:/i);
  assert.doesNotMatch(combined, /localhost:3000|json-server/i);
  assert.doesNotMatch(combined, /Your Phone Number|Your Name/);
  assert.doesNotMatch(html, />Fitness<|>Premium<|>Vegetarian</);
});
