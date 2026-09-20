import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = await readFile(resolve(root, "js/features/carousel.js"), "utf8");

test("carousel state is index-based and percentage-driven", () => {
  assert.match(source, /activeIndex \* 100/);
  assert.doesNotMatch(source, /getComputedStyle/);
  assert.doesNotMatch(source, /replace\(\/\\D/);
});

test("carousel layout styling stays in CSS instead of JavaScript", () => {
  assert.doesNotMatch(source, /cssText/);
  assert.doesNotMatch(source, /style\.width/);
  assert.doesNotMatch(source, /style\.display/);
});

test("carousel exposes grouped slides and button pickers", () => {
  assert.match(source, /aria-roledescription", "slide"/);
  assert.match(source, /carousel-indicator/);
  assert.match(source, /aria-current/);
  assert.match(source, /aria-disabled/);
  assert.match(source, /data-carousel-status/);
  assert.match(source, /Slide \$\{activeIndex \+ 1\} of \$\{slides\.length\}/);
  assert.match(source, /aria-hidden/);
});

test("carousel wraps previous and next navigation", () => {
  assert.match(source, /\(index \+ slides\.length\) % slides\.length/);
});
