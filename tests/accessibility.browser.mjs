import assert from "node:assert/strict";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const viewports = [
  { width: 320, height: 800 },
  { width: 1440, height: 1000 },
];

function summarize(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target),
  }));
}

async function assertNoAccessibilityViolations(page, label) {
  const result = await new AxeBuilder({ page }).analyze();

  assert.deepEqual(
    summarize(result.violations),
    [],
    `${label}: axe accessibility violations detected`,
  );
}

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await assertNoAccessibilityViolations(page, `${viewport.width}px initial page`);

    await page.getByRole("tab", { name: "Premium", exact: true }).click();
    await assertNoAccessibilityViolations(
      page,
      `${viewport.width}px after tab activation`,
    );

    await page.getByRole("button", { name: "Preview Request" }).first().click();
    await assertNoAccessibilityViolations(
      page,
      `${viewport.width}px native dialog open`,
    );

    await page.keyboard.press("Escape");
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Axe accessibility scan passed for ${viewports.length} viewports and interactive states.`);
