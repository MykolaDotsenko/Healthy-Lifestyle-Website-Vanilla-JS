import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

const html = await read("index.html");
const menu = await read("js/features/menu.js");
const carousel = await read("js/features/carousel.js");
const calculator = await read("js/features/calculator.js");

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
  assert.match(carousel, /document\.createElement\("button"\)/);
  assert.match(menu, /document\.createElement\("article"\)/);
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
  assert.match(calculator, /restoreRadioState/);
  assert.match(calculator, /bindRadioGroup/);
  assert.match(calculator, /input\.valueAsNumber/);
  assert.doesNotMatch(calculator, /#gender div/);
  assert.doesNotMatch(calculator, /\.calculating__choose_big div/);
});

test("calculator numeric fields expose native guardrails and error hooks", () => {
  const expectations = [
    ["height", "100", "250", "0.1", "height-error"],
    ["weight", "30", "350", "0.1", "weight-error"],
    ["age", "18", "120", "1", "age-error"],
  ];

  for (const [id, min, max, step, errorId] of expectations) {
    const input = html.match(new RegExp(`<input(?=[^>]*\\bid="${id}")[^>]*>`))?.[0] ?? "";

    assert.match(input, new RegExp(`min="${min}"`));
    assert.match(input, new RegExp(`max="${max}"`));
    assert.match(input, new RegExp(`step="${step.replace(".", "\\.")}"`));
    assert.match(input, new RegExp(`aria-describedby="[^"]*${errorId}[^"]*"`));
    assert.match(input, /aria-invalid="false"/);
  }

  assert.match(html, /id="calculator-status" role="status"/);
  assert.match(html, /Adult estimate only\./);
});
