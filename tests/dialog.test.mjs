import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = await readFile(resolve(root, "js/ui/modal.js"), "utf8");

test("dialog delegates modal behavior to native showModal and close", () => {
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /dialog\.close\(\)/);
  assert.doesNotMatch(source, /document\.body\.style\.overflow/);
  assert.doesNotMatch(source, /keydown/);
});

test("dialog does not use intrusive automatic opening", () => {
  assert.doesNotMatch(source, /setTimeout/);
  assert.doesNotMatch(source, /scrollY/);
  assert.doesNotMatch(source, /addEventListener\("scroll"/);
});

test("dialog restores focus and exposes status without creating nested modals", () => {
  assert.match(source, /returnFocusTarget/);
  assert.match(source, /showStatus/);
  assert.match(source, /data-dialog-status-message/);
});
