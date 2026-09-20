import assert from "node:assert/strict";
import test from "node:test";

import { clearLocalNourishFlowData } from "../js/features/local-data.js";

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

test("clears only NourishFlow-owned persisted data", () => {
  const storage = new FakeStorage({
    "nourishflow.calculator.preferences": "{}",
    "nourishflow.saved-plan": "{}",
    unrelated: "keep",
  });

  assert.equal(clearLocalNourishFlowData(storage), true);
  assert.equal(storage.getItem("nourishflow.calculator.preferences"), null);
  assert.equal(storage.getItem("nourishflow.saved-plan"), null);
  assert.equal(storage.getItem("unrelated"), "keep");
});
