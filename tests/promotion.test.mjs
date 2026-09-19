import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, app] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/app.js"), "utf8"),
]);

test("expired promotion and countdown are removed", async () => {
  assert.doesNotMatch(html, /2024-03-18|20%|role="timer"|id="days"|id="hours"/);
  assert.doesNotMatch(app, /initTimer/);
  await assert.rejects(access(resolve(root, "js/features/timer.js")));
});

test("replacement copy explicitly avoids artificial urgency", () => {
  assert.match(html, /No artificial urgency/);
  assert.match(html, /no fake countdowns or expired discounts/i);
  assert.match(html, /No autoplay, forced popup, or fabricated scarcity/);
});
