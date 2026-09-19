import assert from "node:assert/strict";
import test from "node:test";

import {
  CALCULATOR_STORAGE_KEY,
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

test("stores one normalized versioned preferences object", () => {
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
});

test("loads valid versioned preferences", () => {
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

test("recovers from malformed JSON without throwing", () => {
  const storage = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: "{broken-json",
  });

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "female",
    activityMultiplier: 1.375,
  });
});

test("rejects unsupported stored schema versions", () => {
  const storage = new FakeStorage({
    [CALCULATOR_STORAGE_KEY]: JSON.stringify({
      version: 99,
      sex: "male",
      activityMultiplier: 1.725,
    }),
  });

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "female",
    activityMultiplier: 1.375,
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
  assert.deepEqual(JSON.parse(storage.getItem(CALCULATOR_STORAGE_KEY)), {
    version: 1,
    sex: "male",
    activityMultiplier: 1.55,
  });
});

test("storage failures degrade to defaults instead of breaking calculator boot", () => {
  const storage = {
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

  assert.deepEqual(loadCalculatorPreferences(storage), {
    version: 1,
    sex: "female",
    activityMultiplier: 1.375,
  });
  assert.equal(
    saveCalculatorPreferences(storage, {
      sex: "male",
      activityMultiplier: 1.55,
    }),
    false,
  );
});
