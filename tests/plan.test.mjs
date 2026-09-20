import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPlanSummary,
  formatCalories,
} from "../js/features/plan.js";

test("formats daily energy as an intentionally approximate rounded value", () => {
  assert.match(formatCalories(2182), /^≈ .*2[,.]?180 kcal\/day$/);
  assert.equal(formatCalories(null), "Add your details in the energy calculator");
});

test("builds a useful plan without personal information", () => {
  const plan = buildPlanSummary({
    styleId: "vegetarian",
    calories: 2182,
    now: new Date(2026, 8, 20, 12),
  });

  assert.equal(plan.styleLabel, "Vegetarian");
  assert.match(plan.energy, /kcal\/day$/);
  assert.ok(plan.mealTitle.length > 0);
  assert.ok(plan.mealDescription.length > 0);
  assert.equal("name" in plan, false);
  assert.equal("phone" in plan, false);
});
