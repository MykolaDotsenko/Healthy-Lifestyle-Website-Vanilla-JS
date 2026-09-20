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
  assert.match(html, /<h1 id="main-title">Choose Your Meal Approach<\/h1>/);
  assert.match(html, /<a class="skip-link" href="#main-content">/);
  assert.match(html, /<main id="main-content">/);
});

test("tabs expose the WAI tab contract in logical DOM order", () => {
  assert.equal(count(html, /role="tablist"/g), 1);
  assert.equal(count(html, /role="tab"/g), 4);
  assert.equal(count(html, /role="tabpanel"/g), 4);
  assert.equal(count(html, /aria-selected="true"/g), 1);

  const tabButtons = [
    ...html.matchAll(/<button(?=[^>]*role="tab")[^>]*>[\s\S]*?<\/button>/g),
  ].map((match) => match[0]);
  assert.equal(
    tabButtons.filter((button) => button.includes('tabindex="-1"')).length,
    3,
  );
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

test("CTA flow prioritizes the core planning task before planning tips", () => {
  assert.match(html, /href="#meal-approaches"/);
  assert.ok(count(html, /href="#calculator"/g) >= 2);
  assert.equal(count(html, /data-plan>/g), 1);
  assert.doesNotMatch(html, /href="#"/);

  const order = [
    'id="meal-approaches"',
    'id="calculator"',
    'id="menu"',
    'aria-labelledby="plan-title"',
    'class="offer"',
    'class="weekly"',
  ].map((marker) => html.indexOf(marker));

  assert.ok(order.every((value) => value >= 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("product surface does not request personal information", () => {
  assert.equal(count(html, /<form\b/g), 0);
  assert.doesNotMatch(html, /type="tel"|autocomplete="tel"|autocomplete="name"/);
  assert.doesNotMatch(html, /Your Phone Number|Your Name/);
});

test("plan dialog is labeled and exposes practical actions", () => {
  assert.equal(count(html, /<dialog\b/g), 1);
  assert.match(html, /id="plan-dialog"/);
  assert.match(html, /aria-labelledby="plan-dialog-title"/);
  assert.ok(count(html, /data-close/g) >= 1);
  assert.match(html, /data-swap-plan/);
  assert.match(html, /data-save-plan/);
  assert.match(html, /data-copy-plan/);
  assert.match(html, /data-plan-meals/);
  assert.match(html, /data-plan-shopping/);
  assert.match(html, /data-remove-saved-plan/);
  assert.match(html, /data-clear-local-data/);
});

test("carousel controls remain native buttons and slides have visible captions", () => {
  assert.match(html, /<button class="offer__slider-prev" type="button"/);
  assert.match(html, /<button class="offer__slider-next" type="button"/);
  assert.equal(count(html, /class="offer__slide-caption"/g), 4);
  assert.match(carousel, /document\.createElement\("button"\)/);
});
