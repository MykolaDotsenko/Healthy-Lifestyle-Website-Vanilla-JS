import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = await readFile(resolve(root, "js/ui/tabs.js"), "utf8");

test("tabs implement roving tabindex and selected state", () => {
  assert.match(source, /aria-selected/);
  assert.match(source, /tab\.tabIndex = isActive \? 0 : -1/);
});

test("vertical keyboard model supports arrow, Home, and End keys", () => {
  for (const key of ["ArrowUp", "ArrowDown", "Home", "End"]) {
    assert.match(source, new RegExp(`case "${key}"`));
  }
});

test("tab activation keeps panel visibility synchronized", () => {
  assert.match(source, /panel\.hidden = !isActive/);
  assert.match(source, /aria-controls/);
});
