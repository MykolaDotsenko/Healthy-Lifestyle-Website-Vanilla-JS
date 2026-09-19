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

test("first screen is product-first rather than portfolio-meta UI", () => {
  assert.match(html, /id="main-title" class="visually-hidden"/);
  assert.match(html, /class="tabcontainer"/);
  assert.match(html, /class="preview__life"/);
  assert.doesNotMatch(html, /class="preview__intro"/);
  assert.doesNotMatch(html, /class="preview__proof"/);
  assert.doesNotMatch(html, /Zero-framework frontend portfolio project/);
});

test("header restores the original lightweight NourishFlow logo treatment", () => {
  assert.match(html, /class="header__logo"/);
  assert.match(html, /src="icons\/logo\.svg"/);
  assert.doesNotMatch(html, /class="brand__mark"/);
});

test("restored visual system keeps the original light product language", () => {
  assert.match(css, /--color-surface:\s*#ffffff/);
  assert.match(css, /--color-surface-blue:\s*rgba\(146, 242, 255, 0\.18\)/);
  assert.match(css, /--color-surface-yellow:\s*rgba\(249, 254, 126, 0\.28\)/);
  assert.match(css, /--color-accent:\s*#54ed39/);
  assert.match(css, /\.bgc_blue\s*\{/);
  assert.match(css, /\.offer \.bgc_y\s*\{/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
});

test("visual polish stays responsive and accessible", () => {
  assert.match(css, /--page-gutter:\s*clamp\(/);
  assert.match(css, /--control-min-size:\s*2\.75rem/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
});
