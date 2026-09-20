import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");

test("document exposes product-first metadata", () => {
  assert.match(html, /<title>NourishFlow — Meal Ideas &amp; Daily Energy<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /"@type": "WebApplication"/);
});

test("live product metadata and copy avoid portfolio-demo framing", () => {
  assert.doesNotMatch(
    html,
    /portfolio demo|portfolio project|nutrition demo|web-platform demo|Vanilla JS Nutrition Demo/i,
  );
  assert.doesNotMatch(html, /Preview Request|Demo price:|Nothing was sent or stored/i);
  assert.match(html, /Build My Plan/);
  assert.match(html, /Meal Ideas &amp; Daily Energy/);
});

test("primary navigation labels describe real destinations", () => {
  assert.match(html, />Meal Styles<\/a>/);
  assert.match(html, />Calorie Estimate<\/a>/);
  assert.match(html, /href="#meal-styles"/);
  assert.match(html, /href="#calculator"/);
});
