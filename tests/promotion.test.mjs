import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  getNextWeeklyDeadline,
  getTimeRemaining,
} from "../js/features/timer.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, app, timerSource] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/app.js"), "utf8"),
  readFile(resolve(root, "js/features/timer.js"), "utf8"),
]);

test("weekly countdown is present and initialized", () => {
  assert.match(html, /role="timer"/);
  assert.match(html, /data-timer-part="days"/);
  assert.match(html, /data-timer-part="hours"/);
  assert.match(html, /data-timer-part="minutes"/);
  assert.match(html, /data-timer-part="seconds"/);
  assert.match(html, /data-timer-deadline/);
  assert.match(app, /initTimer\(\)/);
});

test("countdown uses a rolling weekly deadline instead of a stale fixed date", () => {
  assert.doesNotMatch(timerSource, /2024-03-18/);

  const sunday = new Date(2026, 8, 20, 12, 0, 0);
  const deadline = getNextWeeklyDeadline(sunday);

  assert.equal(deadline.getDay(), 1);
  assert.equal(deadline.getHours(), 9);
  assert.equal(deadline.getMinutes(), 0);
  assert.ok(deadline.getTime() > sunday.getTime());
});

test("deadline rolls to the following week once Monday refresh time has passed", () => {
  const mondayAfterRefresh = new Date(2026, 8, 21, 10, 0, 0);
  const deadline = getNextWeeklyDeadline(mondayAfterRefresh);

  assert.equal(deadline.getDay(), 1);
  assert.equal(deadline.getHours(), 9);
  assert.ok(deadline.getTime() > mondayAfterRefresh.getTime());
  assert.ok(deadline.getDate() >= 27 || deadline.getMonth() !== mondayAfterRefresh.getMonth());
});

test("remaining time can never become negative", () => {
  const now = new Date(2026, 8, 21, 10, 0, 0);
  const expired = new Date(2026, 8, 21, 9, 0, 0);
  const remaining = getTimeRemaining(expired, now);

  assert.deepEqual(remaining, {
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
});

test("timer is informational rather than fabricated scarcity", () => {
  assert.match(html, /Weekly menu rhythm/);
  assert.match(html, /informational, not a limited-time offer/i);
  assert.doesNotMatch(html, /20%|limited-time discount|Time Left for the Promotion/i);
});
