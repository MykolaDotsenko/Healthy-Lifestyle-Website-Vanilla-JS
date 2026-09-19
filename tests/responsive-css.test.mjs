import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const css = await readFile(resolve(root, "css/style.css"), "utf8");

test("CSS uses a deliberate layered architecture", () => {
  assert.match(css, /@layer reset, tokens, base, layout, components, utilities, responsive;/);
  for (const layer of ["tokens", "reset", "base", "layout", "components", "utilities", "responsive"]) {
    assert.match(css, new RegExp(`@layer ${layer} \\\{`));
  }
});

test("responsive foundation is fluid instead of desktop-fixed", () => {
  assert.match(css, /--page-gutter:\s*clamp\(/);
  assert.match(css, /inline-size:\s*min\(calc\(100% - \(2 \* var\(--page-gutter\)\)\), var\(--container-max\)\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(100%, 17rem\), 1fr\)\)/);
  assert.doesNotMatch(css, /width:\s*(?:1130|930|850|743|650|580|550|490|330|320|280|220|200|180|170|120|102)px/);
  assert.doesNotMatch(css, /min-width:\s*550px/);
});

test("small-screen controls and content retain accessible sizing", () => {
  assert.match(css, /--control-min-size:\s*2\.75rem/);
  assert.match(css, /min-block-size:\s*var\(--control-min-size\)/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /outline:\s*0\s*[;}]/);
});

test("motion and forced-colors preferences are respected", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /scroll-behavior:\s*auto/);
});

test("responsive breakpoints are mobile-first and content-driven", () => {
  assert.match(css, /@media \(min-width: 40rem\)/);
  assert.match(css, /@media \(min-width: 64rem\)/);
  assert.match(css, /@media \(min-width: 80rem\)/);
  assert.doesNotMatch(css, /@media[^\{]*max-width/);
});

test("legacy placeholder responsive rules are gone", () => {
  assert.doesNotMatch(css, /\.some-element/);
  assert.doesNotMatch(css, /@import\s+url\(https:\/\/fonts\.googleapis\.com/);
});
