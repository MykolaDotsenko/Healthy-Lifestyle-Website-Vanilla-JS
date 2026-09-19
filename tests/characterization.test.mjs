import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");
const script = await readFile(resolve(root, "js/script.js"), "utf8");

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
    countMatches(script, /new MenuCard\(/g),
    3,
    "expected three rendered menu cards",
  );
  assert.equal(
    countMatches(html, /<form\b/g),
    2,
    "expected order and modal contact forms",
  );
});

test("baseline timer, modal, slider, and calculator hooks remain present", () => {
  assert.match(script, /setClock\("\.timer", deadline\)/);
  assert.match(script, /document\.querySelector\("\.modal"\)/);
  assert.match(script, /document\.querySelectorAll\("\.offer__slide"\)/);
  assert.match(script, /localStorage\.setItem\("sex"/);
  assert.match(script, /localStorage\.setItem\("ratio"/);
  assert.match(script, /447\.6 \+ 9\.2 \* weight \+ 3\.1 \* height - 4\.3 \* age/);
  assert.match(script, /88\.36 \+ 13\.4 \* weight \+ 4\.8 \* height - 5\.7 \* age/);
});

test("PR #1 cleanup removes known dead/debug JavaScript", () => {
  assert.doesNotMatch(script, /async function getResource\(/);
  assert.doesNotMatch(script, /console\.log\(/);
});
