import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, css] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "css/style.css"), "utf8"),
]);

test("removed demo-request and obsolete weekly-promotion CSS stays removed", () => {
  for (const selector of [
    ".order__form",
    ".order__input",
    ".modal__input",
    ".menu__item-price",
    ".menu__item-divider",
    ".promotion",
  ]) {
    assert.doesNotMatch(css, new RegExp(selector.replace(".", "\\.")));
  }

  assert.doesNotMatch(html, /class="[^"]*promotion/);
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

test("removed template branding and decorative assets stay removed", async () => {
  for (const path of [
    "icons/logo.svg",
    "icons/facebook.svg",
    "icons/instagram.svg",
    "icons/switch.svg",
    "icons/veg.svg",
  ]) {
    await assert.rejects(access(resolve(root, path)));
  }

  assert.doesNotMatch(html, /Logotype|icons\/logo\.svg/);
});
