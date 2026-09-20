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

test("first screen stays product-first with a real NourishFlow identity", () => {
  assert.match(html, /<h1 id="main-title">Choose Your Meal Approach<\/h1>/);
  assert.match(html, /class="tabcontainer"/);
  assert.match(html, /class="preview__life"/);
  assert.match(html, /class="header__logo brand"/);
  assert.match(html, /class="brand__mark"/);
  assert.match(html, /class="brand__name">NourishFlow<\/span>/);
  assert.doesNotMatch(html, /icons\/logo\.svg|>Logotype</i);
});

test("visual system keeps the original light product language", () => {
  assert.match(css, /--color-surface:\s*#fffefa/);
  assert.match(css, /--color-surface-blue:\s*rgba\(215, 239, 233, 0\.52\)/);
  assert.match(css, /--color-surface-yellow:\s*rgba\(246, 241, 188, 0\.52\)/);
  assert.match(css, /--color-accent:\s*#79d86d/);
  assert.match(css, /--color-accent-strong:\s*#2f7d45/);
  assert.match(css, /--color-accent-soft:\s*#eef9eb/);
  assert.match(css, /\.bgc_blue\s*\{/);
  assert.match(css, /\.offer \.bgc_y\s*\{/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com|\bInter,/);
});

test("brand treatment stays calm, distinctive, and product-first", () => {
  assert.match(css, /\.header__link::after\s*\{[\s\S]*block-size:\s*0\.1875rem/);
  assert.match(css, /\.tabheader__item_active\s*\{[\s\S]*var\(--color-accent-soft\)/);
  assert.match(css, /\.tabcontent img\s*\{[\s\S]*saturate\(0\.84\)/);
});

test("first-screen heading has visible product hierarchy", () => {
  assert.match(css, /\.tabheader h1\s*\{[\s\S]*clamp\(1\.35rem/);
  assert.doesNotMatch(css, /\.tabheader h1\s*\{[\s\S]{0,120}font-size:\s*1rem/);
});

test("carousel now carries useful visible planning content", () => {
  assert.equal((html.match(/class="offer__slide-caption"/g) ?? []).length, 4);
  assert.match(html, /Start with what you have/);
  assert.match(html, /Use a simple three-part plate/);
  assert.match(css, /\.offer__slide-caption\s*\{/);
});

test("deeper plan UI uses the existing design tokens", () => {
  for (const selector of [
    ".plan-summary__overview",
    ".plan-meals",
    ".plan-meal",
    ".plan-shopping",
    ".plan__saved",
  ]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.") + "\\s*\\{"));
  }
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
  assert.match(html, /Planning shortcuts/);
  assert.match(html, /Your daily estimate/);
  assert.match(html, /Explore This Week’s Meal Ideas/);
  assert.match(html, /Build Your NourishFlow Plan/);
  assert.match(html, /Clear local data/);
  assert.doesNotMatch(html, /Interaction system|Pure domain logic|semantic HTML|Vanilla CSS|native JavaScript/i);
});
