import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const css = await readFile(resolve(root, "css/style.css"), "utf8");

test("removed demo-request and stale promotion CSS stays removed", () => {
  for (const selector of [
    ".order__form",
    ".order__input",
    ".modal__input",
    ".promotion__principles",
    ".promotion__principle",
    ".menu__item-price",
    ".menu__item-divider",
  ]) {
    assert.doesNotMatch(css, new RegExp(selector.replace(".", "\\.")));
  }
});

test("removed legacy application files stay removed", async () => {
  for (const path of [
    "js/script.js",
    "js/features/forms.js",
    "tests/forms.test.mjs",
  ]) {
    await assert.rejects(access(resolve(root, path)));
  }
});

test("removed social and decorative assets stay removed", async () => {
  for (const path of [
    "icons/facebook.svg",
    "icons/instagram.svg",
    "icons/switch.svg",
    "icons/veg.svg",
  ]) {
    await assert.rejects(access(resolve(root, path)));
  }
});
