import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIVITY_MULTIPLIERS,
  CALCULATOR_LIMITS,
  calculateDailyCalories,
  normalizeCalculatorPreferences,
  validateCalculatorInput,
} from "../js/domain/calculator.js";

const validInput = {
  sex: "female",
  activityMultiplier: 1.375,
  heightCm: 180,
  weightKg: 80,
  ageYears: 36,
};

test("calculates the preserved female formula deterministically", () => {
  assert.deepEqual(calculateDailyCalories(validInput), {
    ok: true,
    errors: {},
    calories: 2182,
  });
});

test("calculates the preserved male formula deterministically", () => {
  assert.equal(
    calculateDailyCalories({ ...validInput, sex: "male" }).calories,
    2501,
  );
});

test("accepts decimal measurements inside the supported input envelope", () => {
  const result = calculateDailyCalories({
    ...validInput,
    heightCm: 179.5,
    weightKg: 75.5,
  });

  assert.equal(result.ok, true);
  assert.equal(Number.isInteger(result.calories), true);
});

test("rejects missing, non-finite, and out-of-range numeric values", () => {
  const result = validateCalculatorInput({
    ...validInput,
    heightCm: Number.NaN,
    weightKg: CALCULATOR_LIMITS.weightKg.max + 0.1,
    ageYears: 36.5,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.heightCm);
  assert.ok(result.errors.weightKg);
  assert.ok(result.errors.ageYears);
});

test("rejects unsupported categorical values", () => {
  const result = validateCalculatorInput({
    ...validInput,
    sex: "other",
    activityMultiplier: 9,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.sex);
  assert.ok(result.errors.activityMultiplier);
});

test("keeps activity multipliers explicit and allowlisted", () => {
  assert.deepEqual(ACTIVITY_MULTIPLIERS, [1.2, 1.375, 1.55, 1.725]);
});

test("normalizes malformed preferences to safe defaults", () => {
  assert.deepEqual(normalizeCalculatorPreferences(null), {
    version: 1,
    sex: "female",
    activityMultiplier: 1.375,
  });

  assert.deepEqual(
    normalizeCalculatorPreferences({
      sex: "invalid",
      activityMultiplier: "not-a-number",
    }),
    {
      version: 1,
      sex: "female",
      activityMultiplier: 1.375,
    },
  );
});

test("normalizes valid serialized preference values", () => {
  assert.deepEqual(
    normalizeCalculatorPreferences({
      version: 1,
      sex: "male",
      activityMultiplier: "1.55",
    }),
    {
      version: 1,
      sex: "male",
      activityMultiplier: 1.55,
    },
  );
});
