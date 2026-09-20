import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [html, css] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "css/style.css"), "utf8"),
]);

test("first screen stays product-first without recruiter meta UI", () => {
  assert.match(html, /<h1 id="main-title">Choose Your Eating Style<\/h1>/);
  assert.match(html, /class="tabcontainer"/);
  assert.match(html, /class="preview__life"/);
  assert.doesNotMatch(html, /Zero-framework frontend portfolio project/);
});

test("header keeps the lightweight NourishFlow logo treatment", () => {
  assert.match(html, /class="header__logo"/);
  assert.match(html, /src="icons\/logo\.svg"/);
  assert.doesNotMatch(html, /class="brand__mark"/);
});

test("visual system keeps the original light product language", () => {
  assert.match(css, /--color-surface:\s*#ffffff/);
  assert.match(css, /--color-surface-blue:\s*rgba\(146, 242, 255, 0\.18\)/);
  assert.match(css, /--color-surface-yellow:\s*rgba\(249, 254, 126, 0\.28\)/);
  assert.match(css, /--color-accent:\s*#54ed39/);
  assert.match(css, /\.bgc_blue\s*\{/);
  assert.match(css, /\.offer \.bgc_y\s*\{/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
});

test("plan UI uses existing design tokens instead of a new visual system", () => {
  assert.match(css, /\.plan-summary\s*\{/);
  assert.match(css, /\.plan-summary__item\s*\{/);
  assert.match(css, /var\(--color-surface-soft\)/);
  assert.match(css, /var\(--color-border\)/);
});

test("responsive and accessibility protections remain present", () => {
  assert.match(css, /--page-gutter:\s*clamp\(/);
  assert.match(css, /--control-min-size:\s*2\.75rem/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test("product copy is user-facing rather than implementation-facing", () => {
  assert.match(html, /Everyday nutrition/);
  assert.match(html, /Your daily estimate/);
  assert.match(html, /Explore This Week’s Meal Ideas/);
  assert.match(html, /Build Your NourishFlow Plan/);
  assert.doesNotMatch(html, /Interaction system|Pure domain logic|semantic HTML|Vanilla CSS|native JavaScript/i);
});
