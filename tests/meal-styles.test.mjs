import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  MEAL_STYLES,
  getMealStyle,
  getPlanVariantCount,
  getWeeklyMealIdea,
  getWeeklyMenu,
} from "../js/domain/meal-styles.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");

test("meal approaches form one coherent four-style model", () => {
  assert.deepEqual(
    MEAL_STYLES.map(({ id }) => id),
    ["whole-food", "mediterranean", "plant-based", "balanced"],
  );
  assert.deepEqual(
    MEAL_STYLES.map(({ label }) => label),
    ["Whole-Food", "Mediterranean", "Plant-Based", "Balanced"],
  );
  assert.equal(getWeeklyMenu(new Date(2026, 8, 20, 12)).length, 4);
});

test("each approach offers a four-week set with three meals and shopping cues", () => {
  for (const style of MEAL_STYLES) {
    assert.equal(getPlanVariantCount(style.id), 4);

    for (const plan of style.weeklyPlans) {
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
  assert.equal(getMealStyle("missing").id, "whole-food");
});

test("weekly plan changes across weekly boundaries and supports an alternative offset", () => {
  const sunday = getWeeklyMealIdea("plant-based", new Date(2026, 8, 20, 12));
  const nextMonday = getWeeklyMealIdea("plant-based", new Date(2026, 8, 21, 10));
  const alternative = getWeeklyMealIdea(
    "plant-based",
    new Date(2026, 8, 20, 12),
    1,
  );

  assert.notEqual(sunday.title, nextMonday.title);
  assert.notEqual(sunday.title, alternative.title);
  assert.equal(sunday.styleId, "plant-based");
  assert.equal(nextMonday.styleId, "plant-based");
});

test("static tab content matches the canonical labels, images, and descriptions", () => {
  for (const style of MEAL_STYLES) {
    assert.match(html, new RegExp(`data-style-id="${style.id}"`));
    assert.ok(html.includes(`>${style.label}<`) || html.includes(`\n                ${style.label}\n`));
    assert.ok(html.includes(style.image));
    assert.ok(html.includes(style.tabDescription));
  }
});

test("Balanced has its own authored visual", () => {
  const balanced = getMealStyle("balanced");
  assert.match(balanced.image, /food-12\.jpg$/);
  assert.notEqual(balanced.image, getMealStyle("whole-food").image);
});
