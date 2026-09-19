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

test("first screen communicates product and engineering value directly", () => {
  assert.match(html, /<h1 id="main-title">Nutrition UX, built on the web platform\.<\/h1>/);
  assert.match(html, /Zero-framework frontend portfolio project/);
  assert.match(html, /ES modules \+ pure domain logic/);
  assert.match(html, /320px reflow/);
  assert.match(html, /No personal data transmitted/);
  assert.doesNotMatch(html, /id="main-title" class="visually-hidden"/);
});

test("hero exposes two useful next actions without JavaScript dependency", () => {
  assert.match(html, /href="#calculator">Try the calculator<\/a>/);
  assert.match(html, /href="https:\/\/github\.com\/MykolaDotsenko\/Healthy-Lifestyle-Website-Vanilla-JS"/);
});

test("hero layout remains fluid rather than viewport-sized", () => {
  assert.match(css, /\.preview__intro\s*\{/);
  assert.match(css, /grid-template-columns: minmax\(0, 1\.2fr\) minmax\(20rem, 0\.8fr\)/);
  assert.doesNotMatch(css, /\.preview__intro[^}]*100vh/s);
});


test("art direction exposes a coherent brand system without external font requests", () => {
  assert.match(html, /class="brand"/);
  assert.match(html, /class="brand__mark"/);
  assert.match(html, />NourishFlow<\/strong>/);
  assert.match(css, /--font-display:/);
  assert.match(css, /--color-brand:\s*#1f6847/);
  assert.match(css, /--color-coral:\s*#e78368/);
  assert.match(css, /\.preview::before/);
  assert.match(css, /counter-reset:\s*proof/);
  assert.match(css, /font-family:\s*var\(--font-display\)/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
});
