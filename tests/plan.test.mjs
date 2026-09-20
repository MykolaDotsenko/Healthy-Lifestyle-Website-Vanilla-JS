import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPlanSummary,
  formatCalories,
  formatPlanText,
} from "../js/features/plan.js";

test("formats daily energy as an intentionally approximate rounded value", () => {
  assert.match(formatCalories(2182), /^≈ .*2[,.]?180 kcal\/day$/);
  assert.equal(
    formatCalories(null),
    "Optional — calculate your daily estimate above",
  );
});

test("builds a useful three-meal plan without personal information", () => {
  const plan = buildPlanSummary({
    approachId: "plant-based",
    calories: 2182,
    now: new Date(2026, 8, 20, 12),
  });

  assert.equal(plan.approachLabel, "Plant-Based");
  assert.match(plan.energy, /kcal\/day$/);
  assert.ok(plan.title.length > 0);
  assert.ok(plan.summary.length > 0);
  assert.equal(plan.meals.length, 3);
  assert.ok(plan.shopping.length >= 5);
  assert.equal("name" in plan, false);
  assert.equal("phone" in plan, false);
});

test("alternative offset produces another plan without changing the meal approach", () => {
  const first = buildPlanSummary({
    approachId: "balanced",
    now: new Date(2026, 8, 20, 12),
    offset: 0,
  });
  const second = buildPlanSummary({
    approachId: "balanced",
    now: new Date(2026, 8, 20, 12),
    offset: 1,
  });

  assert.equal(first.approachLabel, "Balanced");
  assert.equal(second.approachLabel, "Balanced");
  assert.notEqual(first.title, second.title);
});

test("copy text contains the meal slots and shopping starter", () => {
  const plan = buildPlanSummary({
    approachId: "mediterranean",
    calories: 2000,
    now: new Date(2026, 8, 20, 12),
  });
  const text = formatPlanText(plan);

  assert.match(text, /Meal approach: Mediterranean/);
  assert.match(text, /Morning:/);
  assert.match(text, /Midday:/);
  assert.match(text, /Evening:/);
  assert.match(text, /Shopping starter:/);
});
