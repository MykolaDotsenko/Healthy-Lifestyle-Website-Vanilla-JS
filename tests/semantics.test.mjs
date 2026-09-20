import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, carousel] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/features/carousel.js"), "utf8"),
]);

function count(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

test("document exposes a semantic product structure", () => {
  assert.equal(count(html, /<main\b/g), 1);
  assert.equal(count(html, /<h1\b/g), 1);
  assert.match(html, /<h1 id="main-title">Choose Your Eating Style<\/h1>/);
  assert.match(html, /<a class="skip-link" href="#main-content">/);
  assert.match(html, /<main id="main-content">/);
});

test("tabs expose the WAI tab contract in logical DOM order", () => {
  assert.equal(count(html, /role="tablist"/g), 1);
  assert.equal(count(html, /role="tab"/g), 4);
  assert.equal(count(html, /role="tabpanel"/g), 4);
  assert.equal(count(html, /aria-selected="true"/g), 1);
  assert.equal(count(html, /tabindex="-1"/g), 3);
  assert.match(html, /aria-orientation="vertical"/);
  assert.ok(
    html.indexOf('role="tablist"') < html.indexOf('role="tabpanel"'),
    "tablist should precede tabpanels in DOM order",
  );
});

test("calculator controls use native labels, groups, and output", () => {
  for (const id of [
    "female", "male", "height", "weight", "age",
    "low", "small", "medium", "high",
  ]) {
    assert.match(html, new RegExp('<label[^>]+for="' + id + '"'));
  }

  assert.equal(count(html, /<fieldset\b/g), 3);
  assert.equal(count(html, /<legend\b/g), 3);
  assert.equal(count(html, /<output\b/g), 1);
  assert.match(html, /revised Harris–Benedict/);
});

test("navigation and plan actions point to real product destinations", () => {
  assert.match(html, /href="#meal-styles"/);
  assert.match(html, /href="#calculator"/);
  assert.doesNotMatch(html, /href="#"/);
  assert.ok(count(html, /data-plan/g) >= 3);
});

test("product surface does not request personal information", () => {
  assert.equal(count(html, /<form\b/g), 0);
  assert.doesNotMatch(html, /type="tel"|autocomplete="tel"|autocomplete="name"/);
  assert.doesNotMatch(html, /Your Phone Number|Your Name/);
});

test("plan summary uses a native dialog and explicit close controls", () => {
  assert.equal(count(html, /<dialog\b/g), 1);
  assert.match(html, /id="plan-dialog"/);
  assert.match(html, /aria-labelledby="plan-dialog-title"/);
  assert.ok(count(html, /data-close/g) >= 2);
});

test("carousel controls remain native buttons", () => {
  assert.match(html, /<button class="offer__slider-prev" type="button"/);
  assert.match(html, /<button class="offer__slider-next" type="button"/);
  assert.match(carousel, /document\.createElement\("button"\)/);
});
