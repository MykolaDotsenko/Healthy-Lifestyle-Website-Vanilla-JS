import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = await readFile(resolve(root, "js/ui/modal.js"), "utf8");

test("dialog delegates modality to the native platform", () => {
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /dialog\.close\(\)/);
  assert.doesNotMatch(source, /document\.body\.style\.overflow/);
  assert.doesNotMatch(source, /keydown/);
});

test("dialog restores focus after closing", () => {
  assert.match(source, /returnFocusTarget/);
  assert.match(source, /dialog\.addEventListener\("close"/);
  assert.match(source, /returnFocusTarget\.focus\(\)/);
});

test("dialog has no intrusive automatic opening", () => {
  assert.doesNotMatch(source, /setTimeout|scrollY|addEventListener\("scroll"/);
});
