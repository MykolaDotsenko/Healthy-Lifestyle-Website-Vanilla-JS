import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const css = await readFile(resolve(root, "css/style.css"), "utf8");

test("removed product chrome does not leave dead CSS behind", () => {
  for (const selector of [
    ".pepper",
    ".order__form > img",
  ]) {
    assert.doesNotMatch(css, new RegExp(selector.replace(".", "\\.")));
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
