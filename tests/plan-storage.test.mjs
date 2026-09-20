import assert from "node:assert/strict";
import test from "node:test";

import {
  PLAN_STORAGE_KEY,
  loadPlan,
  savePlan,
} from "../js/features/plan-storage.js";

class FakeStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

const plan = {
  styleId: "balanced",
  styleLabel: "Balanced",
  energy: "≈ 2,100 kcal/day",
  title: "Everyday Balanced",
  summary: "Simple day",
  meals: [
    { slot: "Morning", title: "A", description: "A meal" },
    { slot: "Midday", title: "B", description: "B meal" },
    { slot: "Evening", title: "C", description: "C meal" },
  ],
  shopping: ["one", "two", "three", "four", "five"],
  variantIndex: 0,
};

test("saves and restores one versioned local plan snapshot", () => {
  const storage = new FakeStorage();
  const savedAt = new Date("2026-09-20T12:00:00Z");

  assert.equal(savePlan(storage, plan, savedAt), true);
  assert.deepEqual(loadPlan(storage), {
    version: 1,
    savedAt: savedAt.toISOString(),
    plan,
  });
  assert.ok(storage.getItem(PLAN_STORAGE_KEY));
});

test("malformed and future-version plan payloads are ignored without overwrite", () => {
  const future = JSON.stringify({ version: 2, savedAt: "x", plan });
  const storage = new FakeStorage({ [PLAN_STORAGE_KEY]: future });

  assert.equal(loadPlan(storage), null);
  assert.equal(storage.getItem(PLAN_STORAGE_KEY), future);

  const malformed = new FakeStorage({ [PLAN_STORAGE_KEY]: "{broken" });
  assert.equal(loadPlan(malformed), null);
});

test("invalid plan shapes are not persisted", () => {
  const storage = new FakeStorage();
  assert.equal(savePlan(storage, { styleId: "balanced" }), false);
  assert.equal(storage.getItem(PLAN_STORAGE_KEY), null);
});
