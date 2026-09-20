import assert from "node:assert/strict";
import test from "node:test";

import {
  MEAL_STYLES,
  getMealStyle,
  getWeeklyMealIdea,
  getWeeklyMenu,
} from "../js/domain/meal-styles.js";

test("meal styles form one canonical four-style model", () => {
  assert.deepEqual(
    MEAL_STYLES.map(({ id }) => id),
    ["fitness", "premium", "vegetarian", "balanced"],
  );
  assert.equal(getWeeklyMenu(new Date(2026, 8, 20, 12)).length, 4);
});

test("unknown style IDs fall back safely to the default style", () => {
  assert.equal(getMealStyle("missing").id, "fitness");
});

test("weekly meal idea changes across weekly boundaries", () => {
  const sunday = getWeeklyMealIdea("fitness", new Date(2026, 8, 20, 12));
  const nextMonday = getWeeklyMealIdea("fitness", new Date(2026, 8, 21, 10));

  assert.notEqual(sunday.title, nextMonday.title);
  assert.equal(sunday.styleId, "fitness");
  assert.equal(nextMonday.styleId, "fitness");
});

test("balanced style has its own authored meal image", () => {
  const balanced = getMealStyle("balanced");

  assert.match(balanced.image, /food-12\.jpg$/);
  assert.notEqual(balanced.image, getMealStyle("fitness").image);
});
