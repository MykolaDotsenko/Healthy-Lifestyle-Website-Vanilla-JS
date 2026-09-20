import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  MEAL_APPROACHES,
  getMealApproach,
  getPlanVariantCount,
  getWeeklyPlan,
  getWeeklyPlans,
} from "../js/domain/meal-plans.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");

test("meal approaches form one coherent four-style model", () => {
  assert.deepEqual(
    MEAL_APPROACHES.map(({ id }) => id),
    ["whole-food", "mediterranean", "plant-based", "balanced"],
  );
  assert.deepEqual(
    MEAL_APPROACHES.map(({ label }) => label),
    ["Whole-Food", "Mediterranean", "Plant-Based", "Balanced"],
  );
  assert.equal(getWeeklyPlans(new Date(2026, 8, 20, 12)).length, 4);
});

test("each approach offers a four-week set with three meals and shopping cues", () => {
  for (const approach of MEAL_APPROACHES) {
    assert.equal(getPlanVariantCount(approach.id), 4);

    for (const plan of approach.weeklyPlans) {
      assert.equal(plan.meals.length, 3);
      assert.ok(plan.shopping.length >= 5);
      assert.deepEqual(
        plan.meals.map(({ slot }) => slot),
        ["Morning", "Midday", "Evening"],
      );
    }
  }
});

test("unknown style IDs fall back safely to Whole-Food", () => {
  assert.equal(getMealApproach("missing").id, "whole-food");
});

test("weekly plan changes across weekly boundaries and supports an alternative offset", () => {
  const sunday = getWeeklyPlan("plant-based", new Date(2026, 8, 20, 12));
  const nextMonday = getWeeklyPlan("plant-based", new Date(2026, 8, 21, 10));
  const alternative = getWeeklyPlan(
    "plant-based",
    new Date(2026, 8, 20, 12),
    1,
  );

  assert.notEqual(sunday.title, nextMonday.title);
  assert.notEqual(sunday.title, alternative.title);
  assert.equal(sunday.approachId, "plant-based");
  assert.equal(nextMonday.approachId, "plant-based");
});

test("static tab content matches the canonical labels, images, and descriptions", () => {
  for (const approach of MEAL_APPROACHES) {
    assert.match(html, new RegExp(`data-approach-id="${approach.id}"`));
    assert.ok(html.includes(`>${approach.label}<`) || html.includes(`\n                ${approach.label}\n`));
    assert.ok(html.includes(approach.image));
    assert.ok(html.includes(approach.tabDescription));
  }
});

test("Balanced has its own authored visual", () => {
  const balanced = getMealApproach("balanced");
  assert.match(balanced.image, /food-12\.jpg$/);
  assert.notEqual(balanced.image, getMealApproach("whole-food").image);
});
