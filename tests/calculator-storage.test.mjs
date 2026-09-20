import assert from "node:assert/strict";
import test from "node:test";

import {
  CALCULATOR_STORAGE_KEY,
  clearCalculatorPreferences,
  loadCalculatorPreferences,
  saveCalculatorPreferences,
} from "../js/features/calculator-storage.js";

class FakeStorage {
  constructor(initial = {}) {
    this.values = new Map(
      Object.entries(initial).map(([key, value]) => [key, String(value)]),
    );
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

const defaults = {
  version: 1,
  sex: "female",
  activityMultiplier: 1.375,
};

test("stores one normalized branded preferences object", () => {
  const storage = new FakeStorage();

  assert.equal(
    saveCalculatorPreferences(storage, {
      sex: "male",
      activityMultiplier: 1.55,
    }),
    true,
  );

  assert.deepEqual(JSON.parse(storage.getItem(CALCULATOR_STORAGE_KEY)), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.55,
  });
  assert.equal(CALCULATOR_STORAGE_KEY, "nourishflow.calculator.preferences");
});

test("loads valid current preferences", () => {
  const storage = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: JSON.stringify({
      version: 1,
      sex: "male",
      activityMultiplier: 1.725,
    }),
  });

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.725,
  });
});

test("future schema falls back without destructive downgrade", () => {
  const futurePayload = JSON.stringify({
    version: 2,
    sex: "male",
    activityMultiplier: 1.725,
    futureSetting: true,
  });
  const storage = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: futurePayload,
  });

  assert.deepEqual(loadCalculatorPreferences(storage), defaults);
  assert.equal(storage.getItem(CALCULATOR_STORAGE_KEY), futurePayload);
});

test("migrates the previous NourishFlow storage key once", () => {
  const previousKey = "healthy-lifestyle.calculator.preferences";
  const storage = new FakeStorage({
    [previousKey]: JSON.stringify({
      version: 1,
      sex: "male",
      activityMultiplier: 1.55,
    }),
  });

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.55,
  });
  assert.equal(storage.getItem(previousKey), null);
  assert.deepEqual(JSON.parse(storage.getItem(CALCULATOR_STORAGE_KEY)), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.55,
  });
});

test("migrates legacy sex and ratio keys once", () => {
  const storage = new FakeStorage({
    sex: "male",
    ratio: "1.55",
  });

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.55,
  });
  assert.equal(storage.getItem("sex"), null);
  assert.equal(storage.getItem("ratio"), null);
});

test("malformed data and storage failures degrade safely", () => {
  const malformed = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: "{broken-json",
  });
  assert.deepEqual(loadCalculatorPreferences(malformed), defaults);

  const unavailable = {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
    removeItem() {
      throw new Error("storage unavailable");
    },
  };
  assert.deepEqual(loadCalculatorPreferences(unavailable), defaults);
  assert.equal(saveCalculatorPreferences(unavailable, defaults), false);
});

test("clear removes current and legacy calculator preference keys", () => {
  const storage = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: "{}",
    "healthy-lifestyle.calculator.preferences": "{}",
    sex: "male",
    ratio: "1.55",
    unrelated: "keep",
  });

  assert.equal(clearCalculatorPreferences(storage), true);
  assert.equal(storage.getItem(CALCULATOR_STORAGE_KEY), null);
  assert.equal(storage.getItem("healthy-lifestyle.calculator.preferences"), null);
  assert.equal(storage.getItem("sex"), null);
  assert.equal(storage.getItem("ratio"), null);
  assert.equal(storage.getItem("unrelated"), "keep");
});
