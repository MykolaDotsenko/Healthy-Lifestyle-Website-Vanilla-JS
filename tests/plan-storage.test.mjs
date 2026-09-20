import assert from "node:assert/strict";
import test from "node:test";

import {
  PLAN_STORAGE_KEY,
  loadPlan,
  removePlan,
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

  removeItem(key) {
    this.values.delete(key);
  }
}

const plan = {
  approachId: "balanced",
  approachLabel: "Balanced",
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
    version: 2,
    savedAt: savedAt.toISOString(),
    plan,
  });
  assert.ok(storage.getItem(PLAN_STORAGE_KEY));
});

test("migrates v1 style fields to the v2 approach schema", () => {
  const savedAt = "2026-09-20T12:00:00.000Z";
  const v1Plan = {
    ...plan,
    styleId: plan.approachId,
    styleLabel: plan.approachLabel,
  };
  delete v1Plan.approachId;
  delete v1Plan.approachLabel;

  const storage = new FakeStorage({
    [PLAN_STORAGE_KEY]: JSON.stringify({
      version: 1,
      savedAt,
      plan: v1Plan,
    }),
  });

  assert.deepEqual(loadPlan(storage), {
    version: 2,
    savedAt,
    plan,
  });
  assert.equal(
    JSON.parse(storage.getItem(PLAN_STORAGE_KEY)).version,
    2,
  );
});

test("malformed and future-version plan payloads are ignored without overwrite", () => {
  const future = JSON.stringify({ version: 3, savedAt: "2026-09-20T12:00:00.000Z", plan });
  const storage = new FakeStorage({ [PLAN_STORAGE_KEY]: future });

  assert.equal(loadPlan(storage), null);
  assert.equal(storage.getItem(PLAN_STORAGE_KEY), future);

  const malformed = new FakeStorage({ [PLAN_STORAGE_KEY]: "{broken" });
  assert.equal(loadPlan(malformed), null);
});

test("rejects structurally incomplete saved plans", () => {
  const storage = new FakeStorage();

  assert.equal(savePlan(storage, { ...plan, summary: "" }), false);
  assert.equal(savePlan(storage, { ...plan, variantIndex: -1 }), false);
  assert.equal(savePlan(storage, { ...plan, meals: plan.meals.slice(0, 2) }), false);
  assert.equal(storage.getItem(PLAN_STORAGE_KEY), null);
});

test("removes a saved plan without affecting unrelated storage", () => {
  const storage = new FakeStorage({
    [PLAN_STORAGE_KEY]: JSON.stringify({
      version: 2,
      savedAt: "2026-09-20T12:00:00.000Z",
      plan,
    }),
    unrelated: "keep",
  });

  assert.equal(removePlan(storage), true);
  assert.equal(storage.getItem(PLAN_STORAGE_KEY), null);
  assert.equal(storage.getItem("unrelated"), "keep");
});
