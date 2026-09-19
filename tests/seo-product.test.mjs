import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, menu] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "js/features/menu.js"), "utf8"),
]);

test("document exposes complete product and social metadata", () => {
  assert.match(html, /<title>NourishFlow — Accessible Vanilla JS Nutrition Demo<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /"@type": "WebApplication"/);
});

test("portfolio copy does not impersonate a live delivery business", () => {
  const productCopy = `${html}\n${menu}`;

  assert.doesNotMatch(
    productCopy,
    /Food Delivery|Contact Us|tel:\+|Find Us on Social Media|Or Call Us/,
  );
  assert.doesNotMatch(
    productCopy,
    /restaurant menu without going to a restaurant|optimal price and high quality/i,
  );
  assert.match(html, /portfolio product concept/i);
  assert.match(html, /View source on GitHub/);
  assert.match(html, /No personal data is sent or stored/);
});

test("primary navigation labels describe real destinations", () => {
  assert.match(html, />Meal Styles<\/a>/);
  assert.match(html, />Calorie Estimate<\/a>/);
});
