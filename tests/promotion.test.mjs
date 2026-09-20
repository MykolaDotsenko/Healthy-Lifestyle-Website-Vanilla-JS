import assert from "node:assert/strict";
import test from "node:test";

import {
  getCurrentWeeklyCycleStart,
  getNextWeeklyDeadline,
  getTimeRemaining,
  getWeeklyCycleIndex,
} from "../js/domain/weekly-cycle.js";

test("weekly cycle uses Monday at 09:00 local time", () => {
  const sunday = new Date(2026, 8, 20, 12, 0, 0);
  const deadline = getNextWeeklyDeadline(sunday);

  assert.equal(deadline.getDay(), 1);
  assert.equal(deadline.getHours(), 9);
  assert.equal(deadline.getMinutes(), 0);
  assert.ok(deadline.getTime() > sunday.getTime());
});

test("current cycle and next deadline share the same boundary", () => {
  const mondayAfterRefresh = new Date(2026, 8, 21, 10, 0, 0);
  const start = getCurrentWeeklyCycleStart(mondayAfterRefresh);
  const deadline = getNextWeeklyDeadline(mondayAfterRefresh);

  assert.equal(start.getDay(), 1);
  assert.equal(start.getHours(), 9);
  assert.equal(deadline.getDay(), 1);
  assert.equal(deadline.getHours(), 9);
  assert.equal(deadline.getTime() - start.getTime() >= 6 * 86_400_000, true);
});

test("weekly cycle index changes after the refresh boundary", () => {
  const before = getWeeklyCycleIndex(new Date(2026, 8, 21, 8, 59, 59));
  const after = getWeeklyCycleIndex(new Date(2026, 8, 21, 9, 0, 1));

  assert.equal(after, before + 1);
});

test("remaining time can never become negative", () => {
  const now = new Date(2026, 8, 21, 10, 0, 0);
  const expired = new Date(2026, 8, 21, 9, 0, 0);

  assert.deepEqual(getTimeRemaining(expired, now), {
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
});
