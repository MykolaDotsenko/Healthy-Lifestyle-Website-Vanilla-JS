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
const app = await read("js/app.js");
const timer = await read("js/features/timer.js");
const modal = await read("js/ui/modal.js");
const menu = await read("js/features/menu.js");
const carousel = await read("js/features/carousel.js");
const calculator = await read("js/features/calculator.js");
const calculatorDomain = await read("js/domain/calculator.js");
const calculatorStorage = await read("js/features/calculator-storage.js");

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

test("baseline interactive surface remains intact", () => {
  assert.equal(
    countMatches(html, /class="[^"]*\btabheader__item\b[^"]*"/g),
    4,
    "expected four eating-style tabs",
  );
  assert.equal(
    countMatches(html, /class="offer__slide"/g),
    4,
    "expected four carousel slides",
  );
  assert.equal(
    countMatches(menu, /price:\s*\d+/g),
    3,
    "expected three menu items",
  );
  assert.equal(
    countMatches(html, /<form\b/g),
    2,
    "expected order and modal contact forms",
  );
});

test("baseline timer, modal, slider, and calculator hooks remain present", () => {
  assert.match(app, /initTimer\(\)/);
  assert.match(timer, /DEFAULT_DEADLINE = "2024-03-18"/);
  assert.match(modal, /document\.querySelector\("\.modal"\)/);
  assert.match(carousel, /document\.querySelectorAll\("\.offer__slide"\)/);
  assert.match(calculator, /loadCalculatorPreferences/);
  assert.match(calculator, /saveCalculatorPreferences/);
  assert.match(
    calculatorStorage,
    /healthy-lifestyle\.calculator\.preferences/,
  );
  assert.match(
    calculatorDomain,
    /447\.6[\s\S]*9\.2 \* input\.weightKg[\s\S]*3\.1 \* input\.heightCm[\s\S]*4\.3 \* input\.ageYears/,
  );
  assert.match(
    calculatorDomain,
    /88\.36[\s\S]*13\.4 \* input\.weightKg[\s\S]*4\.8 \* input\.heightCm[\s\S]*5\.7 \* input\.ageYears/,
  );
});

test("legacy monolith patterns do not return", () => {
  const combined = [
    app,
    timer,
    modal,
    menu,
    carousel,
    calculator,
    calculatorDomain,
    calculatorStorage,
  ].join("\n");

  assert.doesNotMatch(combined, /async function getResource\(/);
  assert.doesNotMatch(combined, /console\.log\(/);
  assert.doesNotMatch(combined, /DOMContentLoaded/);
});
