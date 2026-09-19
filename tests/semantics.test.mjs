import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");
const script = await readFile(resolve(root, "js/script.js"), "utf8");

function count(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

test("document exposes a semantic page structure", () => {
  assert.equal(count(html, /<main\b/g), 1);
  assert.equal(count(html, /<h1\b/g), 1);
  assert.ok(count(html, /<section\b/g) >= 6);
  assert.match(html, /<a class="skip-link" href="#main-content">/);
  assert.match(html, /<main id="main-content">/);
});

test("interactive controls use native elements", () => {
  assert.equal(count(html, /class="[^"]*\btabheader__item\b[^"]*"/g), 4);
  assert.equal(count(html, /<button[^>]+class="tabheader__item/g), 4);
  assert.equal(count(html, /type="radio"/g), 6);
  assert.equal(count(html, /<fieldset\b/g), 3);
  assert.equal(count(html, /<legend\b/g), 3);
  assert.match(html, /<button class="offer__slider-prev" type="button"/);
  assert.match(html, /<button class="offer__slider-next" type="button"/);
  assert.doesNotMatch(html, /<div class="modal__close"/);
  assert.match(script, /document\.createElement\("button"\)/);
  assert.match(script, /document\.createElement\("article"\)/);
});

test("form controls have explicit labels and meaningful input types", () => {
  const ids = [
    "female",
    "male",
    "height",
    "weight",
    "age",
    "low",
    "small",
    "medium",
    "high",
    "order-name",
    "order-phone",
    "modal-name",
    "modal-phone",
  ];

  for (const id of ids) {
    assert.match(html, new RegExp(`<label[^>]+for="${id}"`), `missing label for #${id}`);
  }

  assert.equal(count(html, /type="tel"/g), 2);
  assert.doesNotMatch(html, /type="phone"/);
  assert.equal(count(html, /<output\b/g), 1);
});

test("fake navigation links are removed", () => {
  assert.doesNotMatch(html, /href="#"/);
  assert.match(html, /href="#menu"/);
  assert.match(html, /href="#calculator"/);
  assert.match(html, /href="tel:\+380938235311"/);
  assert.match(html, /href="tel:\+358466224959"/);
});

test("all authored HTML buttons declare an explicit type", () => {
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(buttons.length > 0);

  for (const button of buttons) {
    assert.match(button, /\btype="(?:button|submit)"/);
  }
});

test("calculator uses radio state and numeric browser values", () => {
  assert.match(script, /initRadioSettings/);
  assert.match(script, /bindRadioSettings/);
  assert.match(script, /input\.valueAsNumber/);
  assert.doesNotMatch(script, /#gender div/);
  assert.doesNotMatch(script, /\.calculating__choose_big div/);
});
